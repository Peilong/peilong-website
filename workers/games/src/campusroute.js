// Campus Route (daily puzzle). The server starts the clock, checks every route with the page's own rules (core.js),
// and measures the official time itself: (moment the fastest route was found - start) + 30 s per wrong guess.
//   POST /route/start  -> { runId, dateKey, number }
//   POST /route/check  { runId, route } -> { fastest, cost, tries, ms? }
//   POST /route/submit { runId, name } -> { ok, id, name, ms, rankToday, boards }
//   GET  /route/leaderboard -> { boards: { dateKey, number, today, yesterday, days } }
// One entry per name per day: a name's first saved time of the day is the one that counts.
import Core from '../../../assets/games/campus-route/core.js';
import { nameKey } from './names.js';
import { json, readJson, ipHash, startLimited, checkNameWithBlocks } from './common.js';

const PENALTY_MS = 30000;
const SUBMIT_WINDOW_MS = 30 * 60 * 1000;      // save within 30 minutes of solving
const MIN_MS_BASE = 1500;                     // fastest believable solve: 1.5 s + 0.4 s per path on the route
const MIN_MS_PER_STOP = 400;
const BOARD_SIZE = 10;

function shiftDay(key, delta) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + delta)).toISOString().slice(0, 10);
}

export async function start(request, env) {
  const ip = await ipHash(request, env);
  const now = Date.now();
  const limited = await startLimited(env, 'route_runs', ip, now);
  if (limited) return limited;
  const runId = crypto.randomUUID();
  const dateKey = Core.dateKey(now);
  await env.DB.prepare('INSERT INTO route_runs (id, date_key, started_at, ip_hash) VALUES (?, ?, ?, ?)')
    .bind(runId, dateKey, now, ip).run();
  return json({ runId, dateKey, number: Core.dayNumber(dateKey) });
}

async function getRun(env, runId) {
  if (typeof runId !== 'string' || runId.length > 64) return null;
  return env.DB.prepare('SELECT * FROM route_runs WHERE id = ?').bind(runId).first();
}

export async function check(request, env) {
  const body = await readJson(request);
  if (!body) return json({ error: 'Bad request.' }, 400);
  const run = await getRun(env, body.runId);
  if (!run) return json({ error: 'This game could not be found.' }, 404);
  if (run.solved_ms !== null) return json({ fastest: true, tries: run.tries, ms: run.solved_ms });   // already solved

  const puzzle = Core.dailyPuzzle(run.date_key);
  const r = Core.checkRoute(puzzle, body.route);
  if (!r.complete) return json({ error: 'That is not a complete route.' }, 400);
  const now = Date.now(), tries = run.tries + 1;
  if (!r.fastest) {
    await env.DB.prepare('UPDATE route_runs SET tries = ? WHERE id = ? AND solved_ms IS NULL').bind(tries, run.id).run();
    return json({ fastest: false, cost: r.cost, tries });
  }
  const elapsed = now - run.started_at;
  if (elapsed < MIN_MS_BASE + MIN_MS_PER_STOP * (body.route.length - 1)) {
    return json({ error: 'This time could not be verified.' }, 422);
  }
  const ms = elapsed + PENALTY_MS * (tries - 1);
  await env.DB.prepare('UPDATE route_runs SET tries = ?, solved_ms = ?, solved_at = ? WHERE id = ? AND solved_ms IS NULL')
    .bind(tries, ms, now, run.id).run();
  return json({ fastest: true, cost: r.cost, tries, ms });
}

export async function submit(request, env) {
  const body = await readJson(request);
  if (!body) return json({ error: 'Bad request.' }, 400);
  const run = await getRun(env, body.runId);
  if (!run) return json({ error: 'This game could not be found.' }, 404);
  if (run.solved_ms === null) return json({ error: 'Find the fastest route first.' }, 400);
  if (run.submitted) return json({ error: 'This time is already saved.' }, 409);
  if (Date.now() - run.solved_at > SUBMIT_WINDOW_MS) return json({ error: 'This time is too old to save.' }, 410);

  const checked = await checkNameWithBlocks(body.name, env);
  if (checked.error) return json({ error: checked.error, field: 'name' }, 400);
  const key = nameKey(checked.name);
  const taken = await env.DB.prepare('SELECT 1 FROM route_scores WHERE date_key = ? AND name_key = ?').bind(run.date_key, key).first();
  if (taken) return json({ error: `“${checked.name}” is already on today’s board. Each name counts once a day.`, field: 'name' }, 409);

  const claim = await env.DB.prepare('UPDATE route_runs SET submitted = 1 WHERE id = ? AND submitted = 0').bind(run.id).run();
  if (!claim.meta.changes) return json({ error: 'This time is already saved.' }, 409);
  const inserted = await env.DB.prepare(
    'INSERT INTO route_scores (date_key, name, name_key, ms, tries, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(run.date_key, checked.name, key, run.solved_ms, run.tries, Date.now()).run();

  const ahead = await env.DB.prepare('SELECT COUNT(*) AS n FROM route_scores WHERE hidden = 0 AND date_key = ? AND ms < ?')
    .bind(run.date_key, run.solved_ms).first();
  return json({ ok: true, id: inserted.meta.last_row_id, name: checked.name, ms: run.solved_ms, rankToday: ahead.n + 1,
                boards: await boards(env) });
}

export async function boards(env) {
  const today = Core.dateKey(), yesterday = shiftDay(today, -1);
  const day = key => env.DB.prepare(
    `SELECT id, name, ms, tries FROM route_scores WHERE hidden = 0 AND date_key = ? ORDER BY ms ASC, created_at ASC LIMIT ${BOARD_SIZE}`
  ).bind(key);
  const days = env.DB.prepare(
    `SELECT MAX(id) AS id, name, COUNT(*) AS days FROM route_scores WHERE hidden = 0 GROUP BY name_key
       ORDER BY days DESC, MIN(created_at) ASC LIMIT ${BOARD_SIZE}`
  );
  const [t, y, d] = await env.DB.batch([day(today), day(yesterday), days]);
  return { dateKey: today, number: Core.dayNumber(today), today: t.results, yesterday: y.results, days: d.results };
}
