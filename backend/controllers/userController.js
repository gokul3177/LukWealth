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
    
    // BOOTSTRAP LOGIC: Check if any Admin exists
    db.get("SELECT COUNT(*) as count FROM users WHERE role = 'admin'", [], async (err, row) => {
        if (err) return res.status(500).json({message: "Internal Server Error"});

        const adminExists = row.count > 0;
        let status = 'pending';
        let message = "Registration successful! Your account is now awaiting Admin approval.";

        if (!adminExists) {
            // Requirement: First user MUST be an Admin
            if (role !== 'admin') {
                return res.status(400).json({
                    message: "System Setup Required: The first account created must be an Administrator. Please select the Admin role to proceed."
                });
            }
            // Auto-approve the first admin
            status = 'active';
            message = "Administrator Setup Successful! Your account is active. You can now log in and approve other users.";
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
            INSERT INTO users (name, email, password, role, status)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.run(query, [name, email, hashedPassword, role, status], function(err){
            if (err) return res.status(500).json({message: "Registration failed. Email might already exist."});
            res.json({ message });
        });
    });
};

exports.loginUser = (req, res)=>{
    const { email, password, role } = req.body;

    db.get("SELECT * FROM users WHERE email =?", [email], async (err, user)=>{
        if (err) return res.status(500).json({message: err.message});

        // 1. Check if user exists
        if(!user){
            return res.status(400).json({message: "User not Found"});
        }
        
        // 3. User status check
        if(user.status === 'pending') {
             return res.status(403).json({message: "Your account is awaiting Admin approval. Please check back later."});
        }
        if(user.status === 'inactive') {
             return res.status(403).json({message: "Your account is inactive. Please contact an admin."});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }
        const token = jwt.sign(
            {id: user.id, role: user.role, name: user.name},
            process.env.JWT_SECRET,
            {expiresIn: "1h"}
        );
        res.json({token})
    });
};

exports.updateUserStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'active' or 'inactive'
    const requesterId = req.user.id;
    const requesterRole = req.user.role;
    
    if (status !== 'active' && status !== 'inactive') {
        return res.status(400).json({message: "Status must be either active or inactive"});
    }

    // Safety: Prevent self-deactivation (Anti-lockout)
    if (status === 'inactive' && id == requesterId) {
        return res.status(400).json({message: "Security Error: You cannot deactivate your own account."});
    }

    // Hierarchy Logic
    db.get("SELECT role, deactivatedByRole FROM users WHERE id = ?", [id], (err, targetUser) => {
        if (err) return res.status(500).json({message: err.message});
        if (!targetUser) return res.status(404).json({message: "User not found"});

        // Role check: Analyst can only manage 'user' role
        if (requesterRole === 'analyst' && targetUser.role !== 'user') {
            return res.status(403).json({message: "Analyst can only toggle status for standard users."});
        }

        // Hierarchy lock: Analyst cannot activate an 'admin' deactivated account
        if (requesterRole === 'analyst' && status === 'active' && targetUser.deactivatedByRole === 'admin') {
            return res.status(403).json({message: "Admin Override: Only an Admin can re-activate this user."});
        }

        const deactivatedBy = (status === 'inactive') ? requesterRole : null;

        db.run("UPDATE users SET status = ?, deactivatedByRole = ? WHERE id = ?", [status, deactivatedBy, id], function(err) {
            if (err) return res.status(500).json({message: err.message});
            res.json({message: `User status updated to ${status}`});
        });
    });
};

exports.deleteUser = (req, res) => {
    const { id } = req.params;
    const requesterId = req.user.id;

    // Safety: Prevent self-deletion
    if (id == requesterId) {
        return res.status(400).json({message: "Security Error: You cannot delete your own account."});
    }

    db.run("DELETE FROM users WHERE id = ?", [id], function(err) {
        if (err) return res.status(500).json({message: err.message});
        if (this.changes === 0) return res.status(404).json({message: "User not found"});
        res.json({message: "User deleted successfully"});
    });
};
