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
