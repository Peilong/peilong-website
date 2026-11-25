// Bit Flip: the server deals each game's seed and re-scores submitted solve times with the page's own rules.
//   POST /start  -> { runId, seed }
//   POST /submit { runId, times, name } -> { ok, id, name, score, rankToday, boards }
//   GET  /leaderboard -> { boards: { today, week, all } }   top 10, best score per name
import Core from '../../../assets/games/bitflip/core.js';
import { nameKey } from './names.js';
import { json, readJson, ipHash, startLimited, checkNameWithBlocks, startOfToday } from './common.js';

const BOARD_SIZE = 10;
const RUN_MAX_AGE_MS = 30 * 60 * 1000;        // a score must be saved within 30 minutes of starting the game

export async function start(request, env) {
  const ip = await ipHash(request, env);
  const now = Date.now();
  const limited = await startLimited(env, 'runs', ip, now);
  if (limited) return limited;
  const runId = crypto.randomUUID();
  const seed = crypto.getRandomValues(new Uint32Array(1))[0];
  await env.DB.prepare('INSERT INTO runs (id, seed, started_at, ip_hash) VALUES (?, ?, ?, ?)')
    .bind(runId, seed, now, ip).run();
  return json({ runId, seed });
}

export async function submit(request, env) {
  const body = await readJson(request);
  if (!body) return json({ error: 'Bad request.' }, 400);
  const { runId, times, name } = body;
  if (typeof runId !== 'string' || runId.length > 64) return json({ error: 'Bad request.' }, 400);

  const run = await env.DB.prepare('SELECT seed, started_at, submitted FROM runs WHERE id = ?').bind(runId).first();
  if (!run) return json({ error: 'This game could not be found. Play again to save a score.' }, 404);
  if (run.submitted) return json({ error: 'This score is already saved.' }, 409);
  const age = Date.now() - run.started_at;
  if (age < Core.GAME_MS) return json({ error: 'This game has not finished yet.' }, 400);
  if (age > RUN_MAX_AGE_MS) return json({ error: 'This game is too old to save. Play again!' }, 410);
  if (Core.validateRun(run.seed, times)) return json({ error: 'This score could not be verified.' }, 422);

  const result = Core.scoreRun(run.seed, times);
  if (result.score <= 0) return json({ error: 'Score at least one point to join the leaderboard.' }, 400);

  const checked = await checkNameWithBlocks(name, env);
  if (checked.error) return json({ error: checked.error, field: 'name' }, 400);

  // Claim the game first, so the same game can never be saved twice.
  const claim = await env.DB.prepare('UPDATE runs SET submitted = 1 WHERE id = ? AND submitted = 0').bind(runId).run();
  if (!claim.meta.changes) return json({ error: 'This score is already saved.' }, 409);

  const key = nameKey(checked.name);
  const inserted = await env.DB.prepare(
    'INSERT INTO scores (name, name_key, score, solved, best_streak, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(checked.name, key, result.score, result.solved, result.bestStreak, Date.now()).run();

  // Place on today's board: 1 + the number of other names with a better score today.
  const ahead = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM (SELECT name_key, MAX(score) AS best FROM scores
       WHERE hidden = 0 AND created_at >= ? AND name_key != ? GROUP BY name_key) WHERE best > ?`
  ).bind(startOfToday(), key, result.score).first();

  return json({
    ok: true, id: inserted.meta.last_row_id, name: checked.name, score: result.score,
    rankToday: ahead.n + 1, boards: await boards(env)
  });
}

const BOARD_SQL = `SELECT id, name, MAX(score) AS score, solved, best_streak AS bestStreak, created_at AS at
  FROM scores WHERE hidden = 0 AND created_at >= ? GROUP BY name_key ORDER BY score DESC, at ASC LIMIT ${BOARD_SIZE}`;

export async function boards(env) {
  const q = since => env.DB.prepare(BOARD_SQL).bind(since);
  const [today, week, all] = await env.DB.batch([q(startOfToday()), q(Date.now() - 7 * 24 * 3600 * 1000), q(0)]);
  return { today: today.results, week: week.results, all: all.results };
}
