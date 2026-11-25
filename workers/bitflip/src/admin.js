// Admin page served at /admin. It asks for the admin key, keeps it only for this browser tab (sessionStorage),
// and lists recent scores with Hide / Show and Block name buttons. All changes go through /admin/api/*.
export const ADMIN_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Bit Flip admin</title>
<style>
  :root { --bg: #f4f7fb; --card: #fff; --ink: #263038; --muted: #66737f; --line: #d7dde3; --accent: #2a7bbe; --warn: #b3261e; }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #1b1c24; --card: #21222c; --ink: #f8f8f2; --muted: #a3a8b4; --line: #3a3d4d; --accent: #6fb1ec; --warn: #ff8a80; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font: 15px/1.45 system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { max-width: 860px; margin: 0 auto; padding: 24px 16px 48px; }
  h1 { font-size: 1.4rem; margin: 0 0 4px; }
  h2 { font-size: 1.05rem; margin: 28px 0 10px; }
  p.note { color: var(--muted); margin: 0 0 18px; }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 14px; overflow-x: auto; }
  form { display: flex; gap: 8px; flex-wrap: wrap; }
  input { flex: 1 1 240px; padding: 10px 12px; border: 1px solid var(--line); border-radius: 10px; background: var(--card); color: var(--ink); font: inherit; }
  button { padding: 8px 14px; border: 1px solid var(--line); border-radius: 999px; background: var(--card); color: var(--ink); font: inherit; cursor: pointer; }
  button.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
  button.danger { color: var(--warn); }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid var(--line); white-space: nowrap; }
  th { font-size: .75rem; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
  td.name { white-space: normal; font-weight: 600; }
  tr.hidden td { opacity: .45; }
  tr.hidden td.actions { opacity: 1; }
  td.actions button + button { margin-left: 6px; }
  .num { font-variant-numeric: tabular-nums; text-align: right; }
  #status { min-height: 1.4em; color: var(--muted); margin: 10px 0 0; }
  [hidden] { display: none !important; }
</style>
</head>
<body>
<main>
  <h1>Bit Flip admin</h1>
  <p class="note">Hide an entry to take it off every board. Block a name to hide all its entries and stop anyone from using it again.</p>

  <section id="login" class="card">
    <form id="login-form">
      <input id="key" type="password" autocomplete="current-password" placeholder="Admin key" aria-label="Admin key" required>
      <button class="primary" type="submit">Open</button>
    </form>
  </section>

  <section id="panel" hidden>
    <div class="card">
      <table>
        <thead><tr><th>Name</th><th class="num">Score</th><th>When (your time)</th><th></th></tr></thead>
        <tbody id="rows"></tbody>
      </table>
    </div>
    <h2>Blocked names</h2>
    <div class="card"><table><tbody id="blocked"></tbody></table></div>
    <p><button id="logout" type="button">Forget key on this tab</button></p>
  </section>
  <p id="status" role="status"></p>
</main>
<script>
(function () {
  var KEY = 'bitflip-admin-key';
  var key = '';
  try { key = sessionStorage.getItem(KEY) || ''; } catch (e) {}
  var $ = function (id) { return document.getElementById(id); };
  function say(t) { $('status').textContent = t || ''; }

  function api(path, body) {
    return fetch('/admin/api/' + path, {
      method: body ? 'POST' : 'GET',
      headers: Object.assign({ 'Authorization': 'Bearer ' + key }, body ? { 'Content-Type': 'application/json' } : {}),
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || ('HTTP ' + r.status)); return d; });
    });
  }

  function cell(tr, text, cls) { var td = document.createElement('td'); td.textContent = text; if (cls) td.className = cls; tr.appendChild(td); return td; }
  function btn(td, label, cls, fn) { var b = document.createElement('button'); b.type = 'button'; b.textContent = label; if (cls) b.className = cls; b.onclick = fn; td.appendChild(b); }

  function render(data) {
    var rows = $('rows'); rows.textContent = '';
    if (!data.scores.length) { var tr0 = document.createElement('tr'); cell(tr0, 'No scores yet.'); rows.appendChild(tr0); }
    data.scores.forEach(function (s) {
      var tr = document.createElement('tr'); if (s.hidden) tr.className = 'hidden';
      cell(tr, s.name, 'name'); cell(tr, s.score, 'num'); cell(tr, new Date(s.at).toLocaleString());
      var td = cell(tr, '', 'actions');
      btn(td, s.hidden ? 'Show' : 'Hide', '', function () { act('hide', { id: s.id, hidden: !s.hidden }, s.hidden ? 'Shown.' : 'Hidden.'); });
      btn(td, 'Block name', 'danger', function () {
        if (confirm('Block "' + s.name + '"? All its entries will be hidden and the name cannot be used again.'))
          act('block', { nameKey: s.nameKey, blocked: true }, 'Blocked.');
      });
      rows.appendChild(tr);
    });
    var bl = $('blocked'); bl.textContent = '';
    if (!data.blocked.length) { var tr1 = document.createElement('tr'); cell(tr1, 'None.'); bl.appendChild(tr1); }
    data.blocked.forEach(function (b) {
      var tr = document.createElement('tr');
      cell(tr, b.nameKey, 'name'); cell(tr, new Date(b.at).toLocaleString());
      btn(cell(tr, '', 'actions'), 'Unblock', '', function () { act('block', { nameKey: b.nameKey, blocked: false }, 'Unblocked (its entries stay hidden until you Show them).'); });
      bl.appendChild(tr);
    });
  }

  function load() {
    say('Loading…');
    return api('scores').then(function (d) {
      $('login').hidden = true; $('panel').hidden = false; render(d); say('');
    }).catch(function (e) {
      $('login').hidden = false; $('panel').hidden = true; say(e.message);
      try { sessionStorage.removeItem(KEY); } catch (x) {}
    });
  }
  function act(path, body, done) { api(path, body).then(function () { return load(); }).then(function () { say(done); }).catch(function (e) { say(e.message); }); }

  $('login-form').onsubmit = function (e) {
    e.preventDefault(); key = $('key').value.trim();
    try { sessionStorage.setItem(KEY, key); } catch (x) {}
    load();
  };
  $('logout').onclick = function () { key = ''; try { sessionStorage.removeItem(KEY); } catch (x) {} $('panel').hidden = true; $('login').hidden = false; say('Key forgotten.'); };
  if (key) load();
}());
</script>
</body>
</html>`;
