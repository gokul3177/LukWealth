const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { logAudit } = require("../utils/auditLogger");
const emailService = require("../utils/emailService");

exports.createUser = async (req, res) => {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
        return res.status(400).json({ message: "All fields required" });
    }

    try {
        const query = `
            INSERT INTO users (name, email, password, role, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `;
        // In this endpoint, password isn't provided directly so this might have been a stub.
        // We'll require a default password or fail. The original code didn't insert a password which would fail NOT NULL.
        // The frontend mainly uses registerUser, not createUser. Let's fix it by setting a dummy password if missing, or failing.
        return res.status(400).json({ message: "Use /register endpoint to create users with passwords." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        // Prepare for Phase 2: Pagination and Search
        const { search, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = "SELECT id, name, email, role, status, deactivated_by_role as \"deactivatedByRole\", created_at FROM users";
        const params = [];

        if (search) {
            query += " WHERE name ILIKE $1 OR email ILIKE $1";
            params.push(`%${search}%`);
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const { rows } = await db.query(query, params);
        
        let countQuery = "SELECT COUNT(*) FROM users";
        let countParams = [];
        if (search) {
            countQuery += " WHERE name ILIKE $1 OR email ILIKE $1";
            countParams.push(`%${search}%`);
        }
        
        const countResult = await db.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);

        res.json({
            data: rows,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "All fields required" });
    }

    try {
        // BOOTSTRAP LOGIC: Check if any Admin exists
        const adminCheck = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
        const adminExists = parseInt(adminCheck.rows[0].count) > 0;
        
        let status = 'pending';
        let message = "Registration successful! Your account is now awaiting Admin approval.";

        if (!adminExists) {
            if (role !== 'admin') {
                return res.status(400).json({
                    message: "System Setup Required: The first account created must be an Administrator. Please select the Admin role to proceed."
                });
            }
            status = 'active';
            message = "Administrator Setup Successful! Your account is active. You can now log in and approve other users.";
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
            INSERT INTO users (name, email, password, role, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `;

        const result = await db.query(query, [name, email, hashedPassword, role, status]);
        const newUser = { id: result.rows[0].id, name, email, role, status };

        // Audit Log
        await logAudit({
            action: 'USER_REGISTER',
            actorId: newUser.id,
            actorRole: role,
            ipAddress: req.ip,
            metadata: { email, status }
        });

        // Email Notification
        if (status === 'pending') {
            await emailService.sendWelcomeEmail(newUser);
        }

        res.json({ message });
    } catch (err) {
        if (err.code === '23505') { // PostgreSQL unique violation
            return res.status(400).json({ message: "Registration failed. Email already exists." });
        }
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = rows[0];

        if (!user) {
            return res.status(400).json({ message: "User not Found" });
        }

        if (user.status === 'pending') {
            return res.status(403).json({ message: "Your account is awaiting Admin approval. Please check back later." });
        }
        if (user.status === 'inactive') {
            return res.status(403).json({ message: "Your account is inactive. Please contact an admin." });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            await logAudit({ action: 'USER_LOGIN_FAILED', actorId: user.id, ipAddress: req.ip });
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        await logAudit({ action: 'USER_LOGIN', actorId: user.id, actorRole: user.role, ipAddress: req.ip });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'active' or 'inactive'
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    if (status !== 'active' && status !== 'inactive') {
        return res.status(400).json({ message: "Status must be either active or inactive" });
    }

    if (status === 'inactive' && id == requesterId) {
        return res.status(400).json({ message: "Security Error: You cannot deactivate your own account." });
    }

    try {
        const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [id]);
        const targetUser = rows[0];

        if (!targetUser) return res.status(404).json({ message: "User not found" });

        if (requesterRole === 'analyst' && targetUser.role !== 'user') {
            return res.status(403).json({ message: "Analyst can only toggle status for standard users." });
        }

        if (requesterRole === 'analyst' && status === 'active' && targetUser.deactivated_by_role === 'admin') {
            return res.status(403).json({ message: "Admin Override: Only an Admin can re-activate this user." });
        }

        const deactivatedBy = (status === 'inactive') ? requesterRole : null;

        await db.query(
            "UPDATE users SET status = $1, deactivated_by_role = $2 WHERE id = $3",
            [status, deactivatedBy, id]
        );

        // Audit Log
        const action = status === 'active' ? (targetUser.status === 'pending' ? 'USER_APPROVED' : 'USER_REACTIVATED') : 'USER_SUSPENDED';
        await logAudit({
            action,
            actorId: requesterId,
            targetUserId: id,
            actorRole: requesterRole,
            ipAddress: req.ip
        });

        // Email Notification
        if (action === 'USER_APPROVED') {
            await emailService.sendApprovalEmail(targetUser);
        } else if (action === 'USER_SUSPENDED') {
            await emailService.sendSuspensionEmail(targetUser);
        }

        res.json({ message: \`User status updated to \${status}\` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    if (id == requesterId) {
        return res.status(400).json({ message: "Security Error: You cannot delete your own account." });
    }

    try {
        const result = await db.query("DELETE FROM users WHERE id = $1", [id]);
        
        if (result.rowCount === 0) return res.status(404).json({ message: "User not found" });

        await logAudit({
            action: 'USER_DELETED',
            actorId: requesterId,
            targetUserId: id,
            actorRole: requesterRole,
            ipAddress: req.ip
        });

        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    try {
        const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = rows[0];

        if (!user) {
            // Do not reveal if user exists or not for security
            return res.json({ message: "If an account with that email exists, a password reset link has been sent." });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await db.query(
            "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
            [user.id, token, expiresAt]
        );

        await emailService.sendPasswordResetEmail(user, token);

        res.json({ message: "If an account with that email exists, a password reset link has been sent." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: "Token and new password required" });

    try {
        const { rows } = await db.query(
            "SELECT * FROM password_reset_tokens WHERE token = $1 AND used = false AND expires_at > NOW()",
            [token]
        );
        const resetRecord = rows[0];

        if (!resetRecord) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await db.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, resetRecord.user_id]);
        await db.query("UPDATE password_reset_tokens SET used = true WHERE id = $1", [resetRecord.id]);

        await logAudit({
            action: 'USER_PASSWORD_RESET',
            actorId: resetRecord.user_id,
            ipAddress: req.ip
        });

        res.json({ message: "Password reset successfully. You can now log in." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
