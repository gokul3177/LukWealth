# API & Database Documentation

## Database Schema

```sql
-- users table
CREATE TABLE IF NOT EXISTS users (
    id               SERIAL PRIMARY KEY,
    name             TEXT NOT NULL,
    email            TEXT UNIQUE NOT NULL,
    password         TEXT NOT NULL,
    role             TEXT NOT NULL CHECK (role IN ('admin','analyst','user')),
    status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','inactive')),
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

-- audit_logs table
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

-- password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used       BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Endpoints

### Auth Routes (`/users`)
- **`POST /register`**: Create a new pending account.
- **`POST /login`**: Exchange email/password for JWT.
- **`POST /forgot-password`**: Request a password reset email.
- **`POST /reset-password`**: Submit new password with reset token.

### Record Routes (`/records`)
- **`GET /`**: Fetch paginated records (`?page=1&limit=10&type=expense`).
- **`POST /`**: Add a new income/expense record.
- **`DELETE /:id`**: Delete a record (author only).
- **`GET /export`**: Download records as CSV.

### Admin Routes (`/admin` and `/users`)
- **`GET /users`**: Fetch all users (paginated, searchable).
- **`POST /users/approve/:id`**: Activate a user.
- **`POST /users/suspend/:id`**: Deactivate a user.
- **`POST /users/reactivate/:id`**: Reactivate a user.
- **`DELETE /users/:id`**: Hard delete user and their records.
- **`GET /admin/stats`**: Fetch platform-wide aggregated metrics.

### AI Routes (`/ai`)
- **`GET /insights`**: Generate OpenAI insights based on 30-day records.
- **`GET /fraud-check`**: Run rule-based anomaly detection on expenses.

### Audit Routes (`/audit`)
- **`GET /`**: Fetch paginated system audit logs.
