const db = require("../db");

exports.getSummary = async (req, res) => {
    const { id, role } = req.user;
    
    const isAudit = !!req.query.userId;
    const isGlobalRequested = req.query.global === 'true' && (role === 'admin' || role === 'analyst');
    const targetUserId = isAudit ? req.query.userId : id;

    let query = 'SELECT COALESCE(SUM(CASE WHEN type = \'income\' THEN amount ELSE 0 END), 0) as total_income, COALESCE(SUM(CASE WHEN type = \'expense\' THEN amount ELSE 0 END), 0) as total_expense FROM records';
    const params = [];

    try {
        if (role === 'analyst' && isAudit && targetUserId != id) {
            const targetUser = await db.query("SELECT role FROM users WHERE id = $1", [targetUserId]);
            if (targetUser.rows.length > 0 && targetUser.rows[0].role === 'analyst') {
                return res.status(403).json({ message: "Privacy Guard: Analysts cannot audit other analysts." });
            }
        }

        if (!isGlobalRequested) {
            params.push(targetUserId);
            query += ` WHERE user_id = $${params.length}`;
        }

        const { rows } = await db.query(query, params);
        res.json(rows[0] || { total_income: 0, total_expense: 0 });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getCategorySummary = async (req, res) => {
    const { id, role } = req.user;

    const isAudit = !!req.query.userId;
    const isGlobalRequested = req.query.global === 'true' && (role === 'admin' || role === 'analyst');
    const targetUserId = isAudit ? req.query.userId : id;

    let query = 'SELECT category, SUM(amount) as total FROM records WHERE type = \'expense\'';
    const params = [];

    try {
        if (role === 'analyst' && isAudit && targetUserId != id) {
            const targetUser = await db.query("SELECT role FROM users WHERE id = $1", [targetUserId]);
            if (targetUser.rows.length > 0 && targetUser.rows[0].role === 'analyst') {
                return res.status(403).json({ message: "Privacy Guard: Analysts cannot audit other analysts." });
            }
        }

        if (!isGlobalRequested) {
            params.push(targetUserId);
            query += ` AND user_id = $${params.length}`;
        }

        query += ' GROUP BY category';

        const { rows } = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getTrends = async (req, res) => {
    const { id, role } = req.user;

    const isAudit = !!req.query.userId;
    const isGlobalRequested = req.query.global === 'true' && (role === 'admin' || role === 'analyst');
    const targetUserId = isAudit ? req.query.userId : id;

    let baseQuery = `
        SELECT TO_CHAR(date, 'YYYY-MM') as month, 
               SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
               SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
        FROM records 
    `;
    const params = [];

    try {
        if (role === 'analyst' && isAudit && targetUserId != id) {
            const targetUser = await db.query("SELECT role FROM users WHERE id = $1", [targetUserId]);
            if (targetUser.rows.length > 0 && targetUser.rows[0].role === 'analyst') {
                return res.status(403).json({ message: "Privacy Guard: Analysts cannot audit other analysts." });
            }
        }

        let finalQuery = baseQuery;
        if (!isGlobalRequested) {
            params.push(targetUserId);
            finalQuery += ` WHERE user_id = $${params.length}`;
        }
        finalQuery += ` GROUP BY TO_CHAR(date, 'YYYY-MM') ORDER BY month ASC`;

        const { rows } = await db.query(finalQuery, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};