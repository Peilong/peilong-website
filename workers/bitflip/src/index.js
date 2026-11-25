// Bit Flip leaderboard API.
//   POST /start        -> { runId, seed }   the server deals each game, so scores can be checked
//   POST /submit       { runId, times, name } -> re-scores the game with the page's own rules (core.js)
//   POST /check-name   { name } -> { ok } or { error }   live feedback while a player types
//   GET  /leaderboard  -> { today, week, all }   top 10 per board, best score per name
//   GET  /admin        -> admin page (hide entries, block names); its API needs the ADMIN_KEY secret
import Core from '../../../assets/games/bitflip/core.js';
import { checkName, nameKey } from './names.js';
import { ADMIN_PAGE } from './admin.js';

const BOARD_SIZE = 10;
const RUN_MAX_AGE_MS = 30 * 60 * 1000;        // a score must be saved within 30 minutes of starting the game
const START_LIMIT = 15;                       // games one visitor may start per 10 minutes
const START_WINDOW_MS = 10 * 60 * 1000;
const RUN_KEEP_MS = 2 * 24 * 60 * 60 * 1000;  // game records are deleted after 2 days
const TIME_ZONE = 'America/New_York';         // "Today" follows Eastern time
const MAX_BODY = 8 * 1024;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    try {
      if (path === '/admin' && request.method === 'GET') {
        return new Response(ADMIN_PAGE, { headers: { 'Content-Type': 'text/html; charset=utf-8', ...SECURITY_HEADERS } });
      }
      if (path.startsWith('/admin/api/')) return await admin(request, env, path);

      const cors = corsHeaders(request, env);
      if (request.method === 'OPTIONS') return new Response(null, { status: cors ? 204 : 403, headers: cors || {} });
      if (request.headers.get('Origin') && !cors) return json({ error: 'Origin not allowed.' }, 403);

      let res;
      if (path === '/start' && request.method === 'POST') res = await start(request, env);
      else if (path === '/submit' && request.method === 'POST') res = await submit(request, env);
      else if (path === '/check-name' && request.method === 'POST') res = await nameCheck(request);
      else if (path === '/leaderboard' && request.method === 'GET') res = json({ boards: await boards(env) });
      else res = json({ error: 'Not found.' }, 404);
      if (cors) for (const [k, v] of Object.entries(cors)) res.headers.set(k, v);
      return res;
    } catch (err) {
      console.error(err && err.stack || err);
      return json({ error: 'Something went wrong. Please try again.' }, 500, corsHeaders(request, env) || {});
    }
  },

  async scheduled(event, env) {
    await env.DB.prepare('DELETE FROM runs WHERE started_at < ?').bind(Date.now() - RUN_KEEP_MS).run();
  }
};

/* ---------- player API ---------- */

async function start(request, env) {
  const ip = await ipHash(request, env);
  const now = Date.now();
  const recent = await env.DB.prepare('SELECT COUNT(*) AS n FROM runs WHERE ip_hash = ? AND started_at > ?')
    .bind(ip, now - START_WINDOW_MS).first();
  if (recent.n >= START_LIMIT) {
    return json({ error: 'That was a lot of games in a row! Take a short break, then play again to save scores.' }, 429);
  }
  const runId = crypto.randomUUID();
  const seed = crypto.getRandomValues(new Uint32Array(1))[0];
  await env.DB.prepare('INSERT INTO runs (id, seed, started_at, ip_hash) VALUES (?, ?, ?, ?)')
    .bind(runId, seed, now, ip).run();
  return json({ runId, seed });
}

async function submit(request, env) {
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

async function nameCheck(request) {
  const body = await readJson(request);
  const checked = checkName(body && body.name);
  return json(checked.error ? { ok: false, error: checked.error } : { ok: true, name: checked.name });
}

async function checkNameWithBlocks(raw, env) {
  const checked = checkName(raw);
  if (checked.error) return checked;
  const blocked = await env.DB.prepare('SELECT 1 FROM blocked_names WHERE name_key = ?').bind(nameKey(checked.name)).first();
  return blocked ? { error: 'Please choose a different name.' } : checked;
}

const BOARD_SQL = `SELECT id, name, MAX(score) AS score, solved, best_streak AS bestStreak, created_at AS at
  FROM scores WHERE hidden = 0 AND created_at >= ? GROUP BY name_key ORDER BY score DESC, at ASC LIMIT ${BOARD_SIZE}`;

async function boards(env) {
  const q = since => env.DB.prepare(BOARD_SQL).bind(since);
  const [today, week, all] = await env.DB.batch([q(startOfToday()), q(Date.now() - 7 * 24 * 3600 * 1000), q(0)]);
  return { today: today.results, week: week.results, all: all.results };
}

// Midnight in Eastern time, as epoch milliseconds.
function startOfToday(now = Date.now()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE, hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23'
  }).formatToParts(new Date(now));
  const get = type => Number(parts.find(p => p.type === type).value);
  return now - ((get('hour') * 60 + get('minute')) * 60 + get('second')) * 1000 - (now % 1000);
}

/* ---------- admin API (Authorization: Bearer <ADMIN_KEY>) ---------- */

async function admin(request, env, path) {
  if (!(await isAdmin(request, env))) return json({ error: 'Wrong or missing admin key.' }, 401);
  if (path === '/admin/api/scores' && request.method === 'GET') {
    const scores = await env.DB.prepare(
      `SELECT id, name, name_key AS nameKey, score, created_at AS at, hidden FROM scores ORDER BY id DESC LIMIT 300`
    ).all();
    const blocked = await env.DB.prepare('SELECT name_key AS nameKey, blocked_at AS at FROM blocked_names ORDER BY blocked_at DESC').all();
    return json({ scores: scores.results, blocked: blocked.results });
  }
  if (path === '/admin/api/hide' && request.method === 'POST') {
    const body = await readJson(request);
    if (!body || !Number.isInteger(body.id)) return json({ error: 'Bad request.' }, 400);
    await env.DB.prepare('UPDATE scores SET hidden = ? WHERE id = ?').bind(body.hidden ? 1 : 0, body.id).run();
    return json({ ok: true });
  }
  if (path === '/admin/api/block' && request.method === 'POST') {
    const body = await readJson(request);
    if (!body || typeof body.nameKey !== 'string' || !body.nameKey) return json({ error: 'Bad request.' }, 400);
    if (body.blocked) {
      await env.DB.batch([
        env.DB.prepare('INSERT OR IGNORE INTO blocked_names (name_key, blocked_at) VALUES (?, ?)').bind(body.nameKey, Date.now()),
        env.DB.prepare('UPDATE scores SET hidden = 1 WHERE name_key = ?').bind(body.nameKey)
      ]);
    } else {
      await env.DB.prepare('DELETE FROM blocked_names WHERE name_key = ?').bind(body.nameKey).run();
    }
    return json({ ok: true });
  }
  return json({ error: 'Not found.' }, 404);
}

async function isAdmin(request, env) {
  const given = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!env.ADMIN_KEY || !given) return false;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([given, env.ADMIN_KEY].map(s => crypto.subtle.digest('SHA-256', enc.encode(s))));
  return crypto.subtle.timingSafeEqual(a, b);
}

/* ---------- helpers ---------- */

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY'
};

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...SECURITY_HEADERS, ...extra }
  });
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (!origin || !allowed.includes(origin.toLowerCase())) return null;
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

async function readJson(request) {
  const len = Number(request.headers.get('Content-Length') || 0);
  if (len > MAX_BODY) return null;
  const text = await request.text();
  if (text.length > MAX_BODY) return null;
  try { const v = JSON.parse(text); return v && typeof v === 'object' ? v : null; } catch (e) { return null; }
}

// A salted hash of the visitor's IP address, used only for the start limit. The address itself is never stored.
async function ipHash(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode((env.HASH_SALT || '') + '|' + ip));
  return [...new Uint8Array(digest)].slice(0, 12).map(b => b.toString(16).padStart(2, '0')).join('');
}
