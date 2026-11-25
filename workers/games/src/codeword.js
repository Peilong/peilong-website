// Code Word (daily word puzzle). The answers live only here (bundled from the git-ignored private/codeword-terms.json),
// so every guess is checked by the server and the word is revealed only when a game ends.
//   POST /word/start    -> { runId, dateKey, number, length, tries }
//   POST /word/guess    { runId, guess } -> { marks, guesses, solved, done, ms?, word?, about? }
//   POST /word/submit   { runId, name } -> { ok, id, name, guesses, ms, rankToday, boards }
//   GET  /word/leaderboard -> { boards: { dateKey, number, today, yesterday, days } }
//   GET  /word/past     -> { past: [{ dateKey, number, length }] }              earlier days, newest first
//   POST /word/practice { dateKey, guess } -> { marks, solved, word?, about? }  earlier days only; nothing is saved
//   GET  /word/reveal?date=YYYY-MM-DD -> { word, about }                         earlier days only
// Ranking: fewest guesses, then fastest server-measured time. One entry per name per day.
import Core from '../../../assets/games/code-word/core.js';
import TERMS from '../private/codeword-terms.json';
import WORDS_TEXT from '../data/words.txt';
import { nameKey } from './names.js';
import { json, readJson, ipHash, startLimited, checkNameWithBlocks } from './common.js';

const WORDS = new Set(WORDS_TEXT.split('\n').filter(Boolean));
const SUBMIT_WINDOW_MS = 30 * 60 * 1000;
const MIN_SOLVE_MS = 1500;
const BOARD_SIZE = 10;
const PAST_LIMIT = 60;

// The word for a day: the list is used in order from day 1, then starts over.
function termFor(key) {
  const n = Core.dayNumber(key);
  if (n < 1) return null;
  return TERMS[(n - 1) % TERMS.length];
}

function checkGuess(raw, word) {
  const guess = Core.clean(raw);
  if (guess.length !== word.length) return { error: `Use ${word.length} letters.` };
  if (!WORDS.has(guess)) return { error: 'That word isn’t in the word list.' };
  return { guess };
}

export async function start(request, env) {
  const ip = await ipHash(request, env);
  const now = Date.now();
  const limited = await startLimited(env, 'word_runs', ip, now);
  if (limited) return limited;
  const dateKey = Core.dateKey(now), term = termFor(dateKey);
  if (!term) return json({ error: 'Code Word starts soon.' }, 404);
  const runId = crypto.randomUUID();
  await env.DB.prepare('INSERT INTO word_runs (id, date_key, started_at, ip_hash) VALUES (?, ?, ?, ?)')
    .bind(runId, dateKey, now, ip).run();
  return json({ runId, dateKey, number: Core.dayNumber(dateKey), length: term.word.length, tries: Core.triesFor(term.word.length) });
}

async function getRun(env, runId) {
  if (typeof runId !== 'string' || runId.length > 64) return null;
  return env.DB.prepare('SELECT * FROM word_runs WHERE id = ?').bind(runId).first();
}

export async function guess(request, env) {
  const body = await readJson(request);
  if (!body) return json({ error: 'Bad request.' }, 400);
  const run = await getRun(env, body.runId);
  if (!run) return json({ error: 'This game could not be found.' }, 404);
  const term = termFor(run.date_key);
  if (run.done) return json({ error: 'This puzzle is already finished.', word: term.word, about: term.about }, 409);

  const checked = checkGuess(body.guess, term.word);
  if (checked.error) return json({ error: checked.error, field: 'guess' }, 400);
  const before = run.guesses ? run.guesses.split(',') : [];
  if (before.includes(checked.guess)) return json({ error: 'You already tried that word.', field: 'guess' }, 400);

  const guesses = before.concat(checked.guess), now = Date.now();
  const solved = checked.guess === term.word;
  const done = solved || guesses.length >= Core.triesFor(term.word.length);
  let ms = null;
  if (solved) {
    ms = now - run.started_at;
    if (ms < MIN_SOLVE_MS) return json({ error: 'This time could not be verified.' }, 422);
  }
  // Only apply this guess if no other guess for the same game slipped in meanwhile.
  const upd = await env.DB.prepare(
    'UPDATE word_runs SET guesses = ?, done = ?, solved_ms = ?, solved_at = ? WHERE id = ? AND guesses = ? AND done = 0'
  ).bind(guesses.join(','), done ? 1 : 0, ms, solved ? now : null, run.id, run.guesses).run();
  if (!upd.meta.changes) return json({ error: 'Please try that guess again.' }, 409);

  const out = { marks: Core.marks(checked.guess, term.word), guesses: guesses.length, solved, done };
  if (solved) out.ms = ms;
  if (done) { out.word = term.word; out.about = term.about; }
  return json(out);
}

export async function submit(request, env) {
  const body = await readJson(request);
  if (!body) return json({ error: 'Bad request.' }, 400);
  const run = await getRun(env, body.runId);
  if (!run) return json({ error: 'This game could not be found.' }, 404);
  if (run.solved_ms === null) return json({ error: 'Solve the puzzle first.' }, 400);
  if (run.submitted) return json({ error: 'This result is already saved.' }, 409);
  if (Date.now() - run.solved_at > SUBMIT_WINDOW_MS) return json({ error: 'This result is too old to save.' }, 410);

  const checked = await checkNameWithBlocks(body.name, env);
  if (checked.error) return json({ error: checked.error, field: 'name' }, 400);
  const key = nameKey(checked.name);
  const taken = await env.DB.prepare('SELECT 1 FROM word_scores WHERE date_key = ? AND name_key = ?').bind(run.date_key, key).first();
  if (taken) return json({ error: `“${checked.name}” is already on today’s board. Each name counts once a day.`, field: 'name' }, 409);

  const claim = await env.DB.prepare('UPDATE word_runs SET submitted = 1 WHERE id = ? AND submitted = 0').bind(run.id).run();
  if (!claim.meta.changes) return json({ error: 'This result is already saved.' }, 409);
  const n = run.guesses.split(',').length;
  const inserted = await env.DB.prepare(
    'INSERT INTO word_scores (date_key, name, name_key, guesses, ms, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(run.date_key, checked.name, key, n, run.solved_ms, Date.now()).run();
  const ahead = await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM word_scores WHERE hidden = 0 AND date_key = ? AND (guesses < ? OR (guesses = ? AND ms < ?))'
  ).bind(run.date_key, n, n, run.solved_ms).first();
  return json({ ok: true, id: inserted.meta.last_row_id, name: checked.name, guesses: n, ms: run.solved_ms,
                rankToday: ahead.n + 1, boards: await boards(env) });
}

export async function boards(env) {
  const today = Core.dateKey(), yesterday = Core.shiftDay(today, -1);
  const day = key => env.DB.prepare(
    `SELECT id, name, guesses, ms FROM word_scores WHERE hidden = 0 AND date_key = ?
       ORDER BY guesses ASC, ms ASC, created_at ASC LIMIT ${BOARD_SIZE}`
  ).bind(key);
  const days = env.DB.prepare(
    `SELECT MAX(id) AS id, name, COUNT(*) AS days FROM word_scores WHERE hidden = 0 GROUP BY name_key
       ORDER BY days DESC, MIN(created_at) ASC LIMIT ${BOARD_SIZE}`
  );
  const [t, y, d] = await env.DB.batch([day(today), day(yesterday), days]);
  return { dateKey: today, number: Core.dayNumber(today), today: t.results, yesterday: y.results, days: d.results };
}

// Earlier days only: their words are no longer secret.
function pastTerm(key) {
  if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key) || key >= Core.dateKey()) return null;
  return termFor(key);
}

export async function past() {
  const out = [];
  let key = Core.shiftDay(Core.dateKey(), -1);
  while (out.length < PAST_LIMIT && Core.dayNumber(key) >= 1) {
    out.push({ dateKey: key, number: Core.dayNumber(key), length: termFor(key).word.length });
    key = Core.shiftDay(key, -1);
  }
  return json({ past: out });
}

export async function practice(request) {
  const body = await readJson(request);
  const term = body && pastTerm(body.dateKey);
  if (!term) return json({ error: 'That puzzle isn’t available.' }, 404);
  const checked = checkGuess(body.guess, term.word);
  if (checked.error) return json({ error: checked.error, field: 'guess' }, 400);
  const solved = checked.guess === term.word;
  const out = { marks: Core.marks(checked.guess, term.word), solved };
  if (solved) { out.word = term.word; out.about = term.about; }
  return json(out);
}

export async function reveal(request) {
  const term = pastTerm(new URL(request.url).searchParams.get('date'));
  if (!term) return json({ error: 'That puzzle isn’t available.' }, 404);
  return json({ word: term.word, about: term.about });
}
