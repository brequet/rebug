-- USERS
CREATE TABLE
    IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        role TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );

CREATE INDEX idx_users_email ON users (email);

-- BOARDS
-- A board is a collection of reports, and each report belongs to a specific board.
CREATE TABLE
    IF NOT EXISTS boards (
        id TEXT PRIMARY KEY NOT NULL,
        owner_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        is_default INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (owner_id) REFERENCES users (id),
        UNIQUE (owner_id, name)
    );

CREATE INDEX idx_boards_owner_id ON boards (owner_id);

-- REPORTS
CREATE TABLE
    IF NOT EXISTS reports (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        board_id TEXT NOT NULL,
        report_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        file_path TEXT NOT NULL,
        thumbnail_file_path TEXT,
        url TEXT,
        browser_name TEXT,
        browser_version TEXT,
        os_name TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (board_id) REFERENCES boards (id)
    );

CREATE INDEX idx_reports_user_id ON reports (user_id);

CREATE INDEX idx_reports_board_id ON reports (board_id);