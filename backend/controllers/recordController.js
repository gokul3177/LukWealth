const db = require("../db");
const { logAudit } = require("../utils/auditLogger");
const stringify = require('csv-stringify');

exports.createRecord = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ message: "Body missing" });
    }

    const { amount, type, category, date, notes, userId } = req.body;

    if (!amount || !type || !category || !date) {
        return res.status(400).json({ message: "Require all fields" });
    }

    if (isNaN(amount)) return res.status(400).json({ message: "Amount must be a number" });
    if (type !== 'income' && type !== 'expense') return res.status(400).json({ message: "Type must be either income or expense" });

    const targetUserId = (req.user.role === 'admin' && userId) ? userId : req.user.id;

    try {
        const query = `
            INSERT INTO records (user_id, amount, type, category, date, notes)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `;
        const { rows } = await db.query(query, [targetUserId, amount, type, category, date, notes]);

        await logAudit({
            action: 'RECORD_CREATED',
            actorId: req.user.id,
            targetUserId: targetUserId,
            actorRole: req.user.role,
            ipAddress: req.ip,
            metadata: { type, amount, category }
        });

        res.json({
            message: "Record created",
            recordId: rows[0].id
        });
    } catch (err) {
        console.error("DB Error: ", err.message);
        res.status(500).json({ message: err.message });
    }
};

exports.getRecords = async (req, res) => {
    const { id, role } = req.user;
    const { type, category, startDate, endDate, page = 1, limit = 50 } = req.query;

    const offset = (page - 1) * limit;
    
    let query = "SELECT id, user_id AS \"userId\", amount, type, category, date, notes FROM records WHERE 1=1";
    let params = [];

    const isAudit = !!req.query.userId;
    const isGlobalRequested = req.query.global === 'true' && (role === 'admin' || role === 'analyst');
    const targetUserId = isAudit ? req.query.userId : id;

    try {
        if (role === 'analyst' && isAudit && targetUserId != id) {
            const userCheck = await db.query("SELECT role FROM users WHERE id = $1", [targetUserId]);
            if (userCheck.rows.length > 0 && userCheck.rows[0].role === 'analyst') {
                return res.status(403).json({ message: "Privacy Guard: Analysts cannot audit other analysts." });
            }
        }

        if (!isGlobalRequested) {
            params.push(targetUserId);
            query += \` AND user_id = \$\${params.length}\`;
        }

        // Filters
        if (type) {
            params.push(type);
            query += \` AND type = \$\${params.length}\`;
        }
        if (category) {
            params.push(category);
            query += \` AND category = \$\${params.length}\`;
        }
        if (startDate) {
            params.push(startDate);
            query += \` AND date >= \$\${params.length}\`;
        }
        if (endDate) {
            params.push(endDate);
            query += \` AND date <= \$\${params.length}\`;
        }

        // Count query for pagination
        const countQuery = query.replace("SELECT id, user_id AS \"userId\", amount, type, category, date, notes", "SELECT COUNT(*)");
        const countResult = await db.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        query += \` ORDER BY date DESC LIMIT \$\${params.length + 1} OFFSET \$\${params.length + 2}\`;
        params.push(limit, offset);

        const { rows } = await db.query(query, params);

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

exports.updateRecord = async (req, res) => {
    const { id } = req.params;
    const { amount, type, category, date, notes } = req.body;

    if (!amount || !type || !category || !date) {
        return res.status(400).json({ message: "Require all fields" });
    }
    if (isNaN(amount)) return res.status(400).json({ message: "Amount must be a number" });
    if (type !== 'income' && type !== 'expense') return res.status(400).json({ message: "Type must be either income or expense" });

    try {
        const query = \`
            UPDATE records
            SET amount = $1, type=$2, category=$3, date=$4, notes=$5
            WHERE id=$6 AND user_id=$7
        \`;
        const params = [amount, type, category, date, notes, id, req.user.id];

        const { rowCount } = await db.query(query, params);

        if (rowCount === 0) return res.status(403).json({ message: "Record not found or unauthorized" });

        res.json({ message: "Record updated" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteRecord = async (req, res) => {
    const { id } = req.params;

    try {
        const query = "DELETE FROM records WHERE id=$1 AND user_id=$2";
        const params = [id, req.user.id];

        const { rowCount } = await db.query(query, params);

        if (rowCount === 0) return res.status(403).json({ message: "Record not found or unauthorized" });

        res.json({ message: "Record deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.exportCSV = async (req, res) => {
    try {
        const { id, role } = req.user;
        const targetUserId = req.query.userId || id;

        // Simplified for phase 2: export user's records
        const query = "SELECT amount, type, category, date, notes FROM records WHERE user_id = $1 ORDER BY date DESC";
        const { rows } = await db.query(query, [targetUserId]);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=\"records.csv\"');

        stringify.stringify(rows, { header: true }, (err, output) => {
            if (err) throw err;
            res.send(output);
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};