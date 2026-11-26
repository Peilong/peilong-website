// Crack the Cipher (daily). The quotations (bundled from the git-ignored private/cipher-quotes.json) and each day's
// letter swap (derived from the HASH_SALT secret) stay here; the page only ever gets the scrambled text.
//   POST /cipher/start  -> { runId, dateKey, number, cipher }
//   POST /cipher/check  { runId, guess: { X: 'E', ... } } -> { solved, wrong, ms?, text?, source? }
//   POST /cipher/hint   { runId, guess } -> { cipher, plain }        reveals one letter, +30 s
//   POST /cipher/submit { runId, name } -> { ok, id, name, ms, rankToday, boards }
//   GET  /cipher/leaderboard, GET /cipher/past, GET /cipher/reveal?date=   (past days: their quotations are public)
// Official time = solve - start + 30 s per hint + 15 s per wrong full answer. One entry per name per day.
import Core from '../../../assets/games/cipher/core.js';
import QUOTES from '../private/cipher-quotes.json';
import { json, readJson, saveDaily, dailyBoards, getRun, startRun } from './common.js';

const RUNS = 'cipher_runs', SCORES = 'cipher_scores';
const SUBMIT_WINDOW_MS = 30 * 60 * 1000;
const MIN_SOLVE_MS = 3000;
const PAST_LIMIT = 60;

function quoteFor(key) {
  const n = Core.dayNumber(key);
  return n < 1 ? null : QUOTES[(n - 1) % QUOTES.length];
}

// The day's letter swap: a seeded shuffle whose seed is an HMAC of the date with a server-only secret.
async function puzzleFor(env, key) {
  const q = quoteFor(key);
  if (!q) return null;
  const mac = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.HASH_SALT || 'dev'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', mac, new TextEncoder().encode('cipher:' + key)));
  let a = (sig[0] << 24 | sig[1] << 16 | sig[2] << 8 | sig[3]) >>> 0;
  const random = () => {                                   // mulberry32
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const key26 = Core.derangement(random);
  const plain = q.text.toUpperCase();
  return { plain, cipher: Core.apply(plain, key26), source: q.source, text: q.text };
}

function cleanGuess(g) {
  const out = {};
  if (!g || typeof g !== 'object') return out;
  for (const k of Object.keys(g).slice(0, 26)) {
    const c = String(k).toUpperCase(), p = String(g[k] || '').toUpperCase();
    if (Core.isLetter(c) && c.length === 1 && Core.isLetter(p) && p.length === 1) out[c] = p;
  }
  return out;
}

export async function start(request, env) {
  const key = Core.dateKey();
  const p = await puzzleFor(env, key);
  if (!p) return json({ error: 'Crack the Cipher starts soon.' }, 404);
  const r = await startRun(request, env, RUNS, key, { number: Core.dayNumber(key), cipher: p.cipher });
  return r instanceof Response ? r : json(r);
}

export async function check(request, env) {
  const body = await readJson(request);
  const run = body && await getRun(env, RUNS, body.runId);
  if (!run) return json({ error: 'This game could not be found.' }, 404);
  const p = await puzzleFor(env, run.date_key);
  if (run.solved_ms !== null) return json({ solved: true, wrong: 0, ms: run.solved_ms, text: p.text, source: p.source });
  const wrong = Core.wrongLetters(p.cipher, p.plain, cleanGuess(body.guess));
  const now = Date.now();
  if (wrong) {
    await env.DB.prepare(`UPDATE ${RUNS} SET misses = misses + 1 WHERE id = ? AND solved_ms IS NULL`).bind(run.id).run();
    return json({ solved: false, wrong });
  }
  if (now - run.started_at < MIN_SOLVE_MS) return json({ error: 'This time could not be verified.' }, 422);
  const ms = now - run.started_at + run.hints * Core.HINT_MS + run.misses * Core.MISS_MS;
  await env.DB.prepare(`UPDATE ${RUNS} SET solved_ms = ?, solved_at = ? WHERE id = ? AND solved_ms IS NULL`).bind(ms, now, run.id).run();
  return json({ solved: true, wrong: 0, ms, text: p.text, source: p.source });
}

export async function hint(request, env) {
  const body = await readJson(request);
  const run = body && await getRun(env, RUNS, body.runId);
  if (!run) return json({ error: 'This game could not be found.' }, 404);
  if (run.solved_ms !== null) return json({ error: 'This puzzle is already solved.' }, 409);
  const p = await puzzleFor(env, run.date_key), guess = cleanGuess(body.guess);
  // Reveal the most frequent letter the player doesn't have right yet.
  const truth = {};
  for (let i = 0; i < p.cipher.length; i++) if (Core.isLetter(p.cipher[i])) truth[p.cipher[i]] = p.plain[i];
  const pick = Core.letterCounts(p.cipher).map(x => x.letter).find(c => guess[c] !== truth[c]);
  if (!pick) return json({ error: 'Every letter is already right.' }, 400);
  await env.DB.prepare(`UPDATE ${RUNS} SET hints = hints + 1 WHERE id = ?`).bind(run.id).run();
  return json({ cipher: pick, plain: truth[pick] });
}

export async function submit(request, env) {
  const body = await readJson(request);
  const run = body && await getRun(env, RUNS, body.runId);
  if (!run) return json({ error: 'This game could not be found.' }, 404);
  if (run.solved_ms === null) return json({ error: 'Crack the cipher first.' }, 400);
  if (run.submitted) return json({ error: 'This result is already saved.' }, 409);
  if (Date.now() - run.solved_at > SUBMIT_WINDOW_MS) return json({ error: 'This result is too old to save.' }, 410);
  const saved = await saveDaily(env, { runs: RUNS, scores: SCORES, run, name: body.name,
    values: { ms: run.solved_ms, hints: run.hints }, rankSql: 'ms < ?', rankArgs: [run.solved_ms] });
  if (saved instanceof Response) return saved;
  return json({ ok: true, ...saved, ms: run.solved_ms, boards: await boards(env) });
}

export async function boards(env) {
  const today = Core.dateKey();
  return dailyBoards(env, { scores: SCORES, cols: 'ms, hints', order: 'ms ASC', today,
    yesterday: Core.shiftDay(today, -1), number: Core.dayNumber(today) });
}

export async function past() {
  const out = [];
  let key = Core.shiftDay(Core.dateKey(), -1);
  while (out.length < PAST_LIMIT && Core.dayNumber(key) >= 1) {
    out.push({ dateKey: key, number: Core.dayNumber(key) });
    key = Core.shiftDay(key, -1);
  }
  return json({ past: out });
}

// Earlier days only: their quotations are no longer secret.
export async function reveal(request, env) {
  const key = new URL(request.url).searchParams.get('date');
  if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key) || key >= Core.dateKey()) {
    return json({ error: 'That puzzle isn’t available.' }, 404);
  }
  const p = await puzzleFor(env, key);
  if (!p) return json({ error: 'That puzzle isn’t available.' }, 404);
  return json({ dateKey: key, number: Core.dayNumber(key), cipher: p.cipher, plain: p.plain, text: p.text, source: p.source });
}
