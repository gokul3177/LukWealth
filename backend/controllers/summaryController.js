const db = require("../db");

exports.getSummary = (req, res) => {
    const { id, role } = req.user;
    
    // Multi-user Audit & Global Logic
    const isAudit = !!req.query.userId;
    const isGlobalRequested = req.query.global === 'true' && (role === 'admin' || role === 'analyst');
    const targetUserId = isAudit ? req.query.userId : id;

    let query = 'SELECT SUM(CASE WHEN type = "income" THEN amount ELSE 0 END) as total_income, SUM(CASE WHEN type = "expense" THEN amount ELSE 0 END) as total_expense FROM records';
    const params = [];

    // Privacy Guard
    if (role === 'analyst' && isAudit && targetUserId != id) {
        db.get("SELECT role FROM users WHERE id = ?", [targetUserId], (err, targetUser) => {
            if (targetUser && targetUser.role === 'analyst') return res.status(403).json({message: "Privacy Guard: Analysts cannot audit other analysts."});
            
            query += ` WHERE userId = ?`;
            params.push(targetUserId);
            db.get(query, params, (err, row) => res.json(row));
        });
        return;
    }

    if (!isGlobalRequested) {
        query += ` WHERE userId = ?`;
        params.push(targetUserId);
    }

    db.get(query, params, (err, row) => {
        if (err) return res.status(500).json({message: err.message});
        res.json(row || { total_income: 0, total_expense: 0 });
    });
};

exports.getCategorySummary = (req, res) => {
    const { id, role } = req.user;

    // Multi-user Audit & Global Logic
    const isAudit = !!req.query.userId;
    const isGlobalRequested = req.query.global === 'true' && (role === 'admin' || role === 'analyst');
    const targetUserId = isAudit ? req.query.userId : id;

    let query = 'SELECT category, SUM(amount) as total FROM records WHERE type = "expense"';
    const params = [];

    // Privacy Guard
    if (role === 'analyst' && isAudit && targetUserId != id) {
        db.get("SELECT role FROM users WHERE id = ?", [targetUserId], (err, targetUser) => {
            if (targetUser && targetUser.role === 'analyst') return res.status(403).json({message: "Privacy Guard: Analysts cannot audit other analysts."});
            
            query += ` AND userId = ? GROUP BY category`;
            params.push(targetUserId);
            db.all(query, params, (err, rows) => res.json(rows));
        });
        return;
    }

    if (!isGlobalRequested) {
        query += ` AND userId = ?`;
        params.push(targetUserId);
    }

    query += ' GROUP BY category';

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({message: err.message});
        res.json(rows);
    });
};

exports.getTrends = (req, res) => {
    const { id, role } = req.user;

    // Multi-user Audit & Global Logic
    const isAudit = !!req.query.userId;
    const isGlobalRequested = req.query.global === 'true' && (role === 'admin' || role === 'analyst');
    const targetUserId = isAudit ? req.query.userId : id;

    let baseQuery = `
        SELECT strftime('%Y-%m', date) as month, 
               SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
               SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
        FROM records 
    `;
    const params = [];

    // Privacy Guard
    if (role === 'analyst' && isAudit && targetUserId != id) {
        db.get("SELECT role FROM users WHERE id = ?", [targetUserId], (err, targetUser) => {
            if (targetUser && targetUser.role === 'analyst') return res.status(403).json({message: "Privacy Guard: Analysts cannot audit other analysts."});
            
            db.all(`${baseQuery} WHERE userId = ? GROUP BY month ORDER BY month ASC`, [targetUserId], (err, rows) => res.json(rows));
        });
        return;
    }

    let finalQuery = baseQuery;
    if (!isGlobalRequested) {
        finalQuery += ` WHERE userId = ?`;
        params.push(targetUserId);
    }
    finalQuery += ` GROUP BY month ORDER BY month ASC`;

    db.all(finalQuery, params, (err, rows) => {
        if (err) return res.status(500).json({message: err.message});
        res.json(rows);
    });
};