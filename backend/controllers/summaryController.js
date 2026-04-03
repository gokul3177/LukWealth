const db = require("../db");

exports.getSummary = (req, res)=>{
    const query = `
        SELECT
            SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS total_income,
            SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS total_expense
        FROM records
    `;

    db.get(query, [], (err, row) => {
        if (err) return res.status(500).json(err);

        const income = row.total_income || 0;
        const expense = row.total_expense || 0;

        res.json({
            total_income: income,
            total_expense: expense,
            net_balance: income-expense
        });
    });
};

exports.getCategorySummary = (req, res)=>{
    const query = `
    SELECT category, SUM(amount) as total
    FROM records
    GROUP BY category
    `;

    db.all(query, [], (err, rows)=>{
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
};