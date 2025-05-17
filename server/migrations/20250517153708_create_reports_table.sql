CREATE TABLE IF NOT EXISTS reports (
    id BLOB PRIMARY KEY NOT NULL,
    user_id BLOB NOT NULL,
    report_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    url TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TRIGGER IF NOT EXISTS update_reports_updated_at
AFTER
UPDATE ON reports FOR EACH ROW BEGIN
UPDATE reports
SET updated_at = strftime('%Y-%m-%d %H:%M:%f', 'now')
WHERE id = OLD.id;
END;