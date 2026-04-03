const db = require("../db");

exports.createUser = (req, res) => {
    const { name, email, role } = req.body;

    if (!name || !email || !role){
        return res.status(400).json({message: "All fields required" });
    }

    const query = `
        INSERT INTO users (name, email, role)
        VALUES (?, ?, ?)
    `;

    db.run(query, [name, email, role], function(err){
        res.json({
            message: "User created",
            userId: this.lastID
        });
    });
};

exports.getUsers = (req, res)=>{
    db.all("SELECT * FROM users", [], (err, rows)=>{
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
};