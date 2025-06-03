CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  products TEXT NOT NULL,
  subtotal REAL NOT NULL,
  tip REAL NOT NULL,
  shipping TEXT NOT NULL,
  taxes REAL NOT NULL,
  total REAL NOT NULL
); 