const db = require('../db');

exports.getAdminStats = async (req, res) => {
    try {
        const stats = {};

        // 1. Pending approvals count
        const pendingRes = await db.query("SELECT COUNT(*) FROM users WHERE status = 'pending'");
        stats.pendingApprovals = parseInt(pendingRes.rows[0].count);

        // 2. Active users count
        const activeRes = await db.query("SELECT COUNT(*) FROM users WHERE status = 'active'");
        stats.activeUsers = parseInt(activeRes.rows[0].count);

        // 3. Total records count
        const recordsRes = await db.query("SELECT COUNT(*) FROM records");
        stats.totalRecords = parseInt(recordsRes.rows[0].count);

        // 4. Platform total income and expense (current month)
        const currentMonthRes = await db.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
            FROM records 
            WHERE TO_CHAR(date, 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM')
        `);
        stats.currentMonth = {
            income: parseFloat(currentMonthRes.rows[0].total_income),
            expense: parseFloat(currentMonthRes.rows[0].total_expense)
        };

        // 5. Recent Audit Activity
        const auditRes = await db.query(`
            SELECT a.*, u.name as actor_name, t.name as target_name 
            FROM audit_logs a
            LEFT JOIN users u ON a.actor_id = u.id
            LEFT JOIN users t ON a.target_user_id = t.id
            ORDER BY a.created_at DESC 
            LIMIT 10
        `);
        stats.recentActivity = auditRes.rows;

        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
