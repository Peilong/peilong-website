// Exam Slots (daily). The puzzle comes from the date (core.js, same on the page); the server times the game and checks
// the answer: every course in one of the day's slots, and no line joining two courses in the same slot.
//   POST /slots/start  -> { runId, dateKey, number }
//   POST /slots/check  { runId, slots: [0, 2, 1, ...] } -> { solved, clashes?, ms? }
//   POST /slots/submit { runId, name } -> { ok, id, name, ms, rankToday, boards }
//   GET  /slots/leaderboard
import Core from '../../../assets/games/exam-slots/core.js';
import { json, readJson, saveDaily, dailyBoards, getRun, startRun } from './common.js';

const RUNS = 'slots_runs', SCORES = 'slots_scores';
const SUBMIT_WINDOW_MS = 30 * 60 * 1000;
const MIN_MS = 1000, MIN_PER_COURSE_MS = 250;   // faster than this is not believable

// Building a puzzle takes a few milliseconds, so each server instance keeps the last few days' puzzles.
const cache = new Map();
function puzzle(key) {
  if (!cache.has(key)) {
    if (cache.size > 4) cache.delete(cache.keys().next().value);
    cache.set(key, Core.dailyPuzzle(key));
  }
  return cache.get(key);
}

export async function start(request, env) {
  const key = Core.dateKey();
  if (Core.dayNumber(key) < 1) return json({ error: 'Exam Slots starts soon.' }, 404);
  const r = await startRun(request, env, RUNS, key, { number: Core.dayNumber(key) });
  return r instanceof Response ? r : json(r);
}

export async function check(request, env) {
  const body = await readJson(request);
  const run = body && await getRun(env, RUNS, body.runId);
  if (!run) return json({ error: 'This game could not be found.' }, 404);
  if (run.solved_ms !== null) return json({ solved: true, ms: run.solved_ms });
  const p = puzzle(run.date_key);
  const slots = Array.isArray(body.slots) ? body.slots.slice(0, p.n).map(s => (Number.isInteger(s) ? s : null)) : [];
  if (!Core.isSolution(p, slots)) return json({ solved: false, clashes: slots.length === p.n ? Core.clashes(p, slots).length : null });
  const now = Date.now(), ms = now - run.started_at;
  if (ms < MIN_MS + MIN_PER_COURSE_MS * p.n) return json({ error: 'This time could not be verified.' }, 422);
  await env.DB.prepare(`UPDATE ${RUNS} SET solved_ms = ?, solved_at = ? WHERE id = ? AND solved_ms IS NULL`).bind(ms, now, run.id).run();
  return json({ solved: true, ms });
}

export async function submit(request, env) {
  const body = await readJson(request);
  const run = body && await getRun(env, RUNS, body.runId);
  if (!run) return json({ error: 'This game could not be found.' }, 404);
  if (run.solved_ms === null) return json({ error: 'Schedule every exam first.' }, 400);
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
