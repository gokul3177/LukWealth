-- users table
CREATE TABLE IF NOT EXISTS users (
    id               SERIAL PRIMARY KEY,
    name             TEXT NOT NULL,
    email            TEXT UNIQUE NOT NULL,
    password         TEXT NOT NULL,
    role             TEXT NOT NULL CHECK (role IN ('admin','analyst','user')),
    status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','active','inactive')),
    deactivated_by_role TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- records table
CREATE TABLE IF NOT EXISTS records (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount      NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    type        TEXT NOT NULL CHECK (type IN ('income','expense')),
    category    TEXT NOT NULL,
    date        DATE NOT NULL,
    notes       TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- audit_logs table (Phase 1.3)
CREATE TABLE IF NOT EXISTS audit_logs (
    id             SERIAL PRIMARY KEY,
    action         TEXT NOT NULL,
    actor_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
    target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    actor_role     TEXT,
    ip_address     TEXT,
    metadata       JSONB,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- password_reset_tokens table (Phase 2)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used       BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_records_user_id  ON records(user_id);
CREATE INDEX IF NOT EXISTS idx_records_type     ON records(type);
CREATE INDEX IF NOT EXISTS idx_records_date     ON records(date);
CREATE INDEX IF NOT EXISTS idx_records_category ON records(category);
CREATE INDEX IF NOT EXISTS idx_audit_actor      ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_target     ON audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_reset_token      ON password_reset_tokens(token);
