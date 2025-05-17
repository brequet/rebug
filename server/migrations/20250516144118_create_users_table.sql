-- migrations/YYYYMMDDHHMMSS_create_users_table.sql
CREATE TABLE IF NOT EXISTS users (
    id BLOB PRIMARY KEY NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')) -- ISO8601 format
);
CREATE TRIGGER IF NOT EXISTS update_users_updated_at
AFTER
UPDATE ON users FOR EACH ROW BEGIN
UPDATE users
SET updated_at = strftime('%Y-%m-%d %H:%M:%f', 'now')
WHERE id = OLD.id;
END;