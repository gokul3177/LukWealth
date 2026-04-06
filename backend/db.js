const sqlite3 = require("sqlite3").verbose()

const db = new sqlite3.Database("./database.db", (err)=>{
    if (err){
        console.error("DB error::", err);
    }
    else{
        console.log("SQLite connected");
    }
})

db.serialize(()=>{
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT, 
            role TEXT, 
            status TEXT DEFAULT 'active',
            deactivatedByRole TEXT
        )
        `);
    db.run(`
        CREATE TABLE IF NOT EXISTS records(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            amount REAL,
            type TEXT,
            category TEXT,
            date TEXT,
            notes TEXT,
            FOREIGN KEY (userId) REFERENCES users(id)
        )
        `
    );

    // Migration: Add deactivatedByRole to users table if it doesn't exist
    db.all("PRAGMA table_info(users)", (err, rows) => {
        const columnExists = rows.some(row => row.name === 'deactivatedByRole');
        if (!columnExists) {
            db.run("ALTER TABLE users ADD COLUMN deactivatedByRole TEXT", (err) => {
                if (err) console.error("Migration error:", err.message);
                else console.log("Migration: Added deactivatedByRole column to users table.");
            });
        }
        // ROLE MIGRATION: Convert 'viewer' to 'user' as per latest requirement
        db.run("UPDATE users SET role = 'user' WHERE role = 'viewer'", (err) => {
            if (err) console.error("Role Migration Err:", err.message);
            else console.log("Role Migration: All 'viewer' roles successfully converted to 'user'.");
        });
    });
});

module.exports = db;