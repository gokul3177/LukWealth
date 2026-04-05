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

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role){
        return res.status(400).json({message: "All fields required" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
        INSERT INTO users (name, email, password, role)
        VALUES (?, ?, ?, ?)
    `;


    db.run(query, [name, email, hashedPassword, role], function(err){
        res.json({message: "User registered"});
    });
};

exports.loginUser = (req, res)=>{
    const { email, password } = req.body;

    db.get("SELECT * FROM users WHERE email =?", [email], async (err, user)=>{
        if (err) return res.status(500).json({message: err.message});

        if(!user){
            return res.status(400).json({message: "User not Found"});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            console.log("DB: user", user)
            return res.status(400).json({
                message: "Invalid credentials"
            });

        }
        const token = jwt.sign(
            {id: user.id, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: "1h"}
        );
        res.json({token})
    });
};
