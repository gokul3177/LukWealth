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
            email TEXT, 
            role TEXT, 
            status TEXT DEFAULT 'active'
        )
        `);
    db.run(`
        CREATE TABLE IF NOT EXISTS records(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL,
            type TEXT,
            category TEXT,
            date TEXT,
            notes TEXT
        )
        `
    );
});

module.exports = db;