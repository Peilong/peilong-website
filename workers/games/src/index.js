// Games API for peilong.github.io (one Worker for every game; deployed as "bitflip-leaderboard" for its original URL).
//   Bit Flip:      POST /start, POST /submit, GET /leaderboard          (see bitflip.js)
//   Campus Route:  POST /route/start, /route/check, /route/submit, GET /route/leaderboard   (see campusroute.js)
//   Code Word:     POST /word/start, /word/guess, /word/submit, /word/practice, GET /word/leaderboard, /word/past,
//                  /word/reveal   (see codeword.js)
//   Shared:        POST /check-name  -> live name feedback while a player types
//   Admin:         GET /admin (page), /admin/api/* (needs the ADMIN_KEY secret)
import * as bitflip from './bitflip.js';
import * as route from './campusroute.js';
import * as word from './codeword.js';
import { json, corsHeaders, readJson, nameCheck, SECURITY_HEADERS } from './common.js';
import { ADMIN_PAGE } from './admin.js';

const RUN_KEEP_MS = 2 * 24 * 60 * 60 * 1000;  // game records (not scores) are deleted after 2 days

const ROUTES = {
  'POST /start': bitflip.start,
  'POST /submit': bitflip.submit,
  'GET /leaderboard': async (req, env) => json({ boards: await bitflip.boards(env) }),
  'POST /route/start': route.start,
  'POST /route/check': route.check,
  'POST /route/submit': route.submit,
  'GET /route/leaderboard': async (req, env) => json({ boards: await route.boards(env) }),
  'POST /word/start': word.start,
  'POST /word/guess': word.guess,
  'POST /word/submit': word.submit,
  'POST /word/practice': word.practice,
  'GET /word/leaderboard': async (req, env) => json({ boards: await word.boards(env) }),
  'GET /word/past': word.past,
  'GET /word/reveal': word.reveal,
  'POST /check-name': nameCheck
};

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

      const handler = ROUTES[request.method + ' ' + path];
      const res = handler ? await handler(request, env) : json({ error: 'Not found.' }, 404);
      if (cors) for (const [k, v] of Object.entries(cors)) res.headers.set(k, v);
      return res;
    } catch (err) {
      console.error(err && err.stack || err);
      return json({ error: 'Something went wrong. Please try again.' }, 500, corsHeaders(request, env) || {});
    }
  },

  async scheduled(event, env) {
    const before = Date.now() - RUN_KEEP_MS;
    await env.DB.batch([
      env.DB.prepare('DELETE FROM runs WHERE started_at < ?').bind(before),
      env.DB.prepare('DELETE FROM route_runs WHERE started_at < ?').bind(before),
      env.DB.prepare('DELETE FROM word_runs WHERE started_at < ?').bind(before)
    ]);
  }
};

/* ---------- admin API (Authorization: Bearer <ADMIN_KEY>) ---------- */

const SCORE_TABLES = { bitflip: 'scores', route: 'route_scores', word: 'word_scores' };

async function admin(request, env, path) {
  if (!(await isAdmin(request, env))) return json({ error: 'Wrong or missing admin key.' }, 401);
  if (path === '/admin/api/scores' && request.method === 'GET') {
    const [b, r, w, blocked] = await env.DB.batch([
      env.DB.prepare(`SELECT 'bitflip' AS game, id, name, name_key AS nameKey, score, NULL AS ms, NULL AS day,
                             created_at AS at, hidden FROM scores ORDER BY id DESC LIMIT 200`),
      env.DB.prepare(`SELECT 'route' AS game, id, name, name_key AS nameKey, NULL AS score, ms, date_key AS day,
                             created_at AS at, hidden FROM route_scores ORDER BY id DESC LIMIT 200`),
      env.DB.prepare(`SELECT 'word' AS game, id, name, name_key AS nameKey, guesses AS score, ms, date_key AS day,
                             created_at AS at, hidden FROM word_scores ORDER BY id DESC LIMIT 200`),
      env.DB.prepare('SELECT name_key AS nameKey, blocked_at AS at FROM blocked_names ORDER BY blocked_at DESC')
    ]);
    const scores = b.results.concat(r.results, w.results).sort((x, y) => y.at - x.at).slice(0, 300);
    return json({ scores, blocked: blocked.results });
  }
  if (path === '/admin/api/hide' && request.method === 'POST') {
    const body = await readJson(request);
    const table = body && SCORE_TABLES[body.game || 'bitflip'];
    if (!table || !Number.isInteger(body.id)) return json({ error: 'Bad request.' }, 400);
    await env.DB.prepare(`UPDATE ${table} SET hidden = ? WHERE id = ?`).bind(body.hidden ? 1 : 0, body.id).run();
    return json({ ok: true });
  }
  if (path === '/admin/api/block' && request.method === 'POST') {
    const body = await readJson(request);
    if (!body || typeof body.nameKey !== 'string' || !body.nameKey) return json({ error: 'Bad request.' }, 400);
    if (body.blocked) {
      await env.DB.batch([
        env.DB.prepare('INSERT OR IGNORE INTO blocked_names (name_key, blocked_at) VALUES (?, ?)').bind(body.nameKey, Date.now()),
        env.DB.prepare('UPDATE scores SET hidden = 1 WHERE name_key = ?').bind(body.nameKey),
        env.DB.prepare('UPDATE route_scores SET hidden = 1 WHERE name_key = ?').bind(body.nameKey),
        env.DB.prepare('UPDATE word_scores SET hidden = 1 WHERE name_key = ?').bind(body.nameKey)
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
