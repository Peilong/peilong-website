-- Bit Flip leaderboard. Apply with: npx wrangler d1 execute bitflip --remote --file schema.sql

-- One row per game started. The server deals the seed, so a score can only be saved for a game it started.
-- ip_hash is a salted hash (never the address itself), used only to rate-limit starts. Rows are deleted after 2 days.
CREATE TABLE IF NOT EXISTS runs (
  id         TEXT PRIMARY KEY,
  seed       INTEGER NOT NULL,
  started_at INTEGER NOT NULL,
  ip_hash    TEXT NOT NULL,
  submitted  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS runs_ip_time ON runs (ip_hash, started_at);
CREATE INDEX IF NOT EXISTS runs_time ON runs (started_at);

-- Saved scores. hidden = 1 removes an entry from every board (set from the admin page).
CREATE TABLE IF NOT EXISTS scores (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  name_key    TEXT NOT NULL,
  score       INTEGER NOT NULL,
  solved      INTEGER NOT NULL,
  best_streak INTEGER NOT NULL,
  created_at  INTEGER NOT NULL,
  hidden      INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS scores_time ON scores (created_at);
CREATE INDEX IF NOT EXISTS scores_name ON scores (name_key);

-- Names blocked from the admin page. A blocked name cannot be used again.
CREATE TABLE IF NOT EXISTS blocked_names (
  name_key   TEXT PRIMARY KEY,
  blocked_at INTEGER NOT NULL
);

-- Campus Route (daily puzzle). One row per started game; the server measures the official time.
CREATE TABLE IF NOT EXISTS route_runs (
  id         TEXT PRIMARY KEY,
  date_key   TEXT NOT NULL,              -- the day's puzzle, YYYY-MM-DD in Eastern time
  started_at INTEGER NOT NULL,
  ip_hash    TEXT NOT NULL,
  tries      INTEGER NOT NULL DEFAULT 0,
  solved_ms  INTEGER,                    -- official time incl. 30 s per wrong guess; NULL until solved
  solved_at  INTEGER,
  submitted  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS route_runs_ip_time ON route_runs (ip_hash, started_at);
CREATE INDEX IF NOT EXISTS route_runs_time ON route_runs (started_at);

-- Saved Campus Route times. One entry per name per day.
CREATE TABLE IF NOT EXISTS route_scores (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  date_key   TEXT NOT NULL,
  name       TEXT NOT NULL,
  name_key   TEXT NOT NULL,
  ms         INTEGER NOT NULL,
  tries      INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  hidden     INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS route_scores_day ON route_scores (date_key, ms);
CREATE UNIQUE INDEX IF NOT EXISTS route_scores_day_name ON route_scores (date_key, name_key);

-- Code Word (daily word puzzle). One row per started game; guesses are stored comma-separated.
CREATE TABLE IF NOT EXISTS word_runs (
  id         TEXT PRIMARY KEY,
  date_key   TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  ip_hash    TEXT NOT NULL,
  guesses    TEXT NOT NULL DEFAULT '',
  done       INTEGER NOT NULL DEFAULT 0,
  solved_ms  INTEGER,                    -- server-measured time; NULL unless solved
  solved_at  INTEGER,
  submitted  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS word_runs_ip_time ON word_runs (ip_hash, started_at);
CREATE INDEX IF NOT EXISTS word_runs_time ON word_runs (started_at);

-- Saved Code Word results. Ranked by guesses, then time. One entry per name per day.
CREATE TABLE IF NOT EXISTS word_scores (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  date_key   TEXT NOT NULL,
  name       TEXT NOT NULL,
  name_key   TEXT NOT NULL,
  guesses    INTEGER NOT NULL,
  ms         INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  hidden     INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS word_scores_day ON word_scores (date_key, guesses, ms);
CREATE UNIQUE INDEX IF NOT EXISTS word_scores_day_name ON word_scores (date_key, name_key);

-- Logic Lights (daily circuit). The circuit comes from the date; the server times the game.
CREATE TABLE IF NOT EXISTS logic_runs (
  id TEXT PRIMARY KEY, date_key TEXT NOT NULL, started_at INTEGER NOT NULL, ip_hash TEXT NOT NULL,
  solved_ms INTEGER, solved_at INTEGER, submitted INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS logic_runs_ip_time ON logic_runs (ip_hash, started_at);
CREATE INDEX IF NOT EXISTS logic_runs_time ON logic_runs (started_at);
CREATE TABLE IF NOT EXISTS logic_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT, date_key TEXT NOT NULL, name TEXT NOT NULL, name_key TEXT NOT NULL,
  ms INTEGER NOT NULL, created_at INTEGER NOT NULL, hidden INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS logic_scores_day ON logic_scores (date_key, ms);
CREATE UNIQUE INDEX IF NOT EXISTS logic_scores_day_name ON logic_scores (date_key, name_key);

-- Crack the Cipher (daily quotation). hints / misses add time to the official result.
CREATE TABLE IF NOT EXISTS cipher_runs (
  id TEXT PRIMARY KEY, date_key TEXT NOT NULL, started_at INTEGER NOT NULL, ip_hash TEXT NOT NULL,
  hints INTEGER NOT NULL DEFAULT 0, misses INTEGER NOT NULL DEFAULT 0,
  solved_ms INTEGER, solved_at INTEGER, submitted INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS cipher_runs_ip_time ON cipher_runs (ip_hash, started_at);
CREATE INDEX IF NOT EXISTS cipher_runs_time ON cipher_runs (started_at);
CREATE TABLE IF NOT EXISTS cipher_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT, date_key TEXT NOT NULL, name TEXT NOT NULL, name_key TEXT NOT NULL,
  ms INTEGER NOT NULL, hints INTEGER NOT NULL, created_at INTEGER NOT NULL, hidden INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS cipher_scores_day ON cipher_scores (date_key, ms);
CREATE UNIQUE INDEX IF NOT EXISTS cipher_scores_day_name ON cipher_scores (date_key, name_key);

-- Exam Slots (daily scheduling puzzle). Ranked by server-measured time.
CREATE TABLE IF NOT EXISTS slots_runs (
  id TEXT PRIMARY KEY, date_key TEXT NOT NULL, started_at INTEGER NOT NULL, ip_hash TEXT NOT NULL,
  solved_ms INTEGER, solved_at INTEGER, submitted INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS slots_runs_ip_time ON slots_runs (ip_hash, started_at);
CREATE INDEX IF NOT EXISTS slots_runs_time ON slots_runs (started_at);
CREATE TABLE IF NOT EXISTS slots_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT, date_key TEXT NOT NULL, name TEXT NOT NULL, name_key TEXT NOT NULL,
  ms INTEGER NOT NULL, created_at INTEGER NOT NULL, hidden INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS slots_scores_day ON slots_scores (date_key, ms);
CREATE UNIQUE INDEX IF NOT EXISTS slots_scores_day_name ON slots_scores (date_key, name_key);
