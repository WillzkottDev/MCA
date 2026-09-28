CREATE TABLE IF NOT EXISTS missionaries (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT '',
  year INTEGER,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_missionaries_name
ON missionaries(name);

CREATE TABLE IF NOT EXISTS contacts (
  missionary_id INTEGER PRIMARY KEY,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  social TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (missionary_id) REFERENCES missionaries(id)
);

CREATE INDEX IF NOT EXISTS idx_contacts_updated_at
ON contacts(updated_at);
