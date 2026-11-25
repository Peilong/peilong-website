// Helpers shared by every game: JSON responses, CORS for the site, request bodies, the visitor hash used for
// rate limits, the start limit itself, and the name check (rules + names blocked from the admin page).
import { checkName, nameKey } from './names.js';

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY'
};
const MAX_BODY = 8 * 1024;

// Starts allowed per visitor per 10 minutes. Generous because a whole class on campus Wi-Fi can share one address.
export const START_LIMIT = 200;
export const START_WINDOW_MS = 10 * 60 * 1000;

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...SECURITY_HEADERS, ...extra }
  });
}

export function corsHeaders(request, env) {
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

export async function readJson(request) {
  const len = Number(request.headers.get('Content-Length') || 0);
  if (len > MAX_BODY) return null;
  const text = await request.text();
  if (text.length > MAX_BODY) return null;
  try { const v = JSON.parse(text); return v && typeof v === 'object' ? v : null; } catch (e) { return null; }
}

// A salted hash of the visitor's IP address, used only for the start limit. The address itself is never stored.
export async function ipHash(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode((env.HASH_SALT || '') + '|' + ip));
  return [...new Uint8Array(digest)].slice(0, 12).map(b => b.toString(16).padStart(2, '0')).join('');
}

// null if this visitor may start another game (in `table`), otherwise the response to send.
export async function startLimited(env, table, ip, now) {
  const recent = await env.DB.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE ip_hash = ? AND started_at > ?`)
    .bind(ip, now - START_WINDOW_MS).first();
  if (recent.n < START_LIMIT) return null;
  return json({ error: 'That was a lot of games in a row! Take a short break, then play again to save scores.' }, 429);
}

export async function checkNameWithBlocks(raw, env) {
  const checked = checkName(raw);
  if (checked.error) return checked;
  const blocked = await env.DB.prepare('SELECT 1 FROM blocked_names WHERE name_key = ?').bind(nameKey(checked.name)).first();
  return blocked ? { error: 'Please choose a different name.' } : checked;
}

export async function nameCheck(request) {
  const body = await readJson(request);
  const checked = checkName(body && body.name);
  return json(checked.error ? { ok: false, error: checked.error } : { ok: true, name: checked.name });
}

// Midnight in Eastern time, as epoch milliseconds ("Today" on the boards).
export function startOfToday(now = Date.now()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23'
  }).formatToParts(new Date(now));
  const get = type => Number(parts.find(p => p.type === type).value);
  return now - ((get('hour') * 60 + get('minute')) * 60 + get('second')) * 1000 - (now % 1000);
}

/* ---------- shared by the daily games (one entry per name per day) ---------- */

// Save a finished daily game. o = { runs, scores, run, name, values: { column: value }, rankSql, rankArgs }.
// Returns a Response for problems (bad or taken name, already saved), else { id, name, rankToday }.
export async function saveDaily(env, o) {
  const checked = await checkNameWithBlocks(o.name, env);
  if (checked.error) return json({ error: checked.error, field: 'name' }, 400);
  const key = nameKey(checked.name);
  const taken = await env.DB.prepare(`SELECT 1 FROM ${o.scores} WHERE date_key = ? AND name_key = ?`).bind(o.run.date_key, key).first();
  if (taken) return json({ error: `“${checked.name}” is already on today’s board. Each name counts once a day.`, field: 'name' }, 409);
  const claim = await env.DB.prepare(`UPDATE ${o.runs} SET submitted = 1 WHERE id = ? AND submitted = 0`).bind(o.run.id).run();
  if (!claim.meta.changes) return json({ error: 'This result is already saved.' }, 409);
  const cols = Object.keys(o.values);
  const inserted = await env.DB.prepare(
    `INSERT INTO ${o.scores} (date_key, name, name_key, ${cols.join(', ')}, created_at) VALUES (?, ?, ?, ${cols.map(() => '?').join(', ')}, ?)`
  ).bind(o.run.date_key, checked.name, key, ...cols.map(c => o.values[c]), Date.now()).run();
  const ahead = await env.DB.prepare(`SELECT COUNT(*) AS n FROM ${o.scores} WHERE hidden = 0 AND date_key = ? AND (${o.rankSql})`)
    .bind(o.run.date_key, ...o.rankArgs).first();
  return { id: inserted.meta.last_row_id, name: checked.name, rankToday: ahead.n + 1 };
}

// Today's and yesterday's top 10 (best first) and the names on the board on the most days.
export async function dailyBoards(env, { scores, cols, order, today, yesterday, number }) {
  const day = key => env.DB.prepare(
    `SELECT id, name, ${cols} FROM ${scores} WHERE hidden = 0 AND date_key = ? ORDER BY ${order}, created_at ASC LIMIT 10`
  ).bind(key);
  const days = env.DB.prepare(
    `SELECT MAX(id) AS id, name, COUNT(*) AS days FROM ${scores} WHERE hidden = 0 GROUP BY name_key
       ORDER BY days DESC, MIN(created_at) ASC LIMIT 10`
  );
  const [t, y, d] = await env.DB.batch([day(today), day(yesterday), days]);
  return { dateKey: today, number, today: t.results, yesterday: y.results, days: d.results };
}

export async function getRun(env, table, runId) {
  if (typeof runId !== 'string' || runId.length > 64) return null;
  return env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(runId).first();
}

export async function startRun(request, env, table, dateKey, extra = {}) {
  const ip = await ipHash(request, env), now = Date.now();
  const limited = await startLimited(env, table, ip, now);
  if (limited) return limited;
  const runId = crypto.randomUUID();
  await env.DB.prepare(`INSERT INTO ${table} (id, date_key, started_at, ip_hash) VALUES (?, ?, ?, ?)`).bind(runId, dateKey, now, ip).run();
  return { runId, dateKey, ...extra };
}
