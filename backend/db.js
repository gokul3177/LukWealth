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
            status TEXT DEFAULT 'active'
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

    // Migration: Add userId to records table if it doesn't exist
    db.all("PRAGMA table_info(records)", (err, rows) => {
        const columnExists = rows.some(row => row.name === 'userId');
        if (!columnExists) {
            db.run("ALTER TABLE records ADD COLUMN userId INTEGER", (err) => {
                if (err) console.error("Migration error:", err.message);
                else console.log("Migration: Added userId column to records table.");
            });
        }
    });
});

module.exports = db;