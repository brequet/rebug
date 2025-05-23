-- USERS
CREATE TABLE
    IF NOT EXISTS users (
        id BLOB PRIMARY KEY NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        role TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (strftime ('%Y-%m-%d %H:%M:%f', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime ('%Y-%m-%d %H:%M:%f', 'now')) -- ISO8601 format
    );

CREATE INDEX idx_users_email ON users (email);

CREATE TRIGGER IF NOT EXISTS update_users_updated_at AFTER
UPDATE ON users FOR EACH ROW BEGIN
UPDATE users
SET
    updated_at = strftime ('%Y-%m-%d %H:%M:%f', 'now')
WHERE
    id = OLD.id;

END;

-- BOARDS
-- A board is a collection of reports, and each report belongs to a specific board.
CREATE TABLE
    IF NOT EXISTS boards (
        id BLOB PRIMARY KEY NOT NULL,
        owner_id BLOB NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        is_default INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (strftime ('%Y-%m-%d %H:%M:%f', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime ('%Y-%m-%d %H:%M:%f', 'now')),
        FOREIGN KEY (owner_id) REFERENCES users (id),
        UNIQUE (owner_id, name)
    );

CREATE INDEX idx_boards_owner_id ON boards (owner_id);

CREATE TRIGGER IF NOT EXISTS update_boards_updated_at AFTER
UPDATE ON boards FOR EACH ROW BEGIN
UPDATE boards
SET
    updated_at = strftime ('%Y-%m-%d %H:%M:%f', 'now')
WHERE
    id = OLD.id;

END;

-- REPORTS
CREATE TABLE
    IF NOT EXISTS reports (
        id BLOB PRIMARY KEY NOT NULL,
        user_id BLOB NOT NULL,
        board_id BLOB NOT NULL,
        report_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        file_path TEXT NOT NULL,
        url TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime ('%Y-%m-%d %H:%M:%f', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime ('%Y-%m-%d %H:%M:%f', 'now')),
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (board_id) REFERENCES boards (id)
    );

CREATE INDEX idx_reports_user_id ON reports (user_id);

CREATE INDEX idx_reports_board_id ON reports (board_id);

CREATE TRIGGER IF NOT EXISTS update_reports_updated_at AFTER
UPDATE ON reports FOR EACH ROW BEGIN
UPDATE reports
SET
    updated_at = strftime ('%Y-%m-%d %H:%M:%f', 'now')
WHERE
    id = OLD.id;

END;