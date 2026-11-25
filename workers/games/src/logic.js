// Logic Lights (daily). The circuit comes from the date (core.js, same on the page); the server times the game and
// checks the answer: the bulb lit with the fewest possible switches on.
//   POST /logic/start  -> { runId, dateKey, number }
//   POST /logic/check  { runId, switches: [0, 1, ...] } -> { solved, lit, count, min, ms? }
//   POST /logic/submit { runId, name } -> { ok, id, name, ms, rankToday, boards }
//   GET  /logic/leaderboard
import Core from '../../../assets/games/logic-lights/core.js';
import { json, readJson, saveDaily, dailyBoards, getRun, startRun } from './common.js';

const RUNS = 'logic_runs', SCORES = 'logic_scores';
const SUBMIT_WINDOW_MS = 30 * 60 * 1000;
const MIN_SOLVE_MS = 1500;

export async function start(request, env) {
  const key = Core.dateKey();
  if (Core.dayNumber(key) < 1) return json({ error: 'Logic Lights starts soon.' }, 404);
  const r = await startRun(request, env, RUNS, key, { number: Core.dayNumber(key) });
  return r instanceof Response ? r : json(r);
}

export async function check(request, env) {
  const body = await readJson(request);
  const run = body && await getRun(env, RUNS, body.runId);
  if (!run) return json({ error: 'This game could not be found.' }, 404);
  if (run.solved_ms !== null) return json({ solved: true, ms: run.solved_ms });
  const c = Core.dailyCircuit(run.date_key);
  const bits = Array.isArray(body.switches) ? body.switches.slice(0, c.inputs).map(b => (b ? 1 : 0)) : [];
  const lit = bits.length === c.inputs && Core.lights(c, bits);
  const count = bits.reduce((a, b) => a + b, 0);
  if (!Core.isSolution(c, bits)) return json({ solved: false, lit, count, min: c.min });
  const now = Date.now(), ms = now - run.started_at;
  if (ms < MIN_SOLVE_MS) return json({ error: 'This time could not be verified.' }, 422);
  await env.DB.prepare(`UPDATE ${RUNS} SET solved_ms = ?, solved_at = ? WHERE id = ? AND solved_ms IS NULL`).bind(ms, now, run.id).run();
  return json({ solved: true, lit, count, min: c.min, ms });
}

export async function submit(request, env) {
  const body = await readJson(request);
  const run = body && await getRun(env, RUNS, body.runId);
  if (!run) return json({ error: 'This game could not be found.' }, 404);
  if (run.solved_ms === null) return json({ error: 'Light the bulb first.' }, 400);
  if (run.submitted) return json({ error: 'This result is already saved.' }, 409);
  if (Date.now() - run.solved_at > SUBMIT_WINDOW_MS) return json({ error: 'This result is too old to save.' }, 410);
  const saved = await saveDaily(env, { runs: RUNS, scores: SCORES, run, name: body.name,
    values: { ms: run.solved_ms }, rankSql: 'ms < ?', rankArgs: [run.solved_ms] });
  if (saved instanceof Response) return saved;
  return json({ ok: true, ...saved, ms: run.solved_ms, boards: await boards(env) });
}

export async function boards(env) {
  const today = Core.dateKey();
  return dailyBoards(env, { scores: SCORES, cols: 'ms', order: 'ms ASC', today,
    yesterday: Core.shiftDay(today, -1), number: Core.dayNumber(today) });
}
