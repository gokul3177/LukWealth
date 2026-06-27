const { OpenAI } = require("openai");
const db = require("../db");

let openai;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

exports.getInsights = async (req, res) => {
    const { id, role } = req.user;
    
    const isAudit = !!req.query.userId;
    const targetUserId = isAudit ? req.query.userId : id;

    try {
        if (role === 'analyst' && isAudit && targetUserId != id) {
            const targetUser = await db.query("SELECT role FROM users WHERE id = $1", [targetUserId]);
            if (targetUser.rows.length > 0 && targetUser.rows[0].role === 'analyst') {
                return res.status(403).json({ message: "Privacy Guard: Analysts cannot audit other analysts." });
            }
        }

        // Fetch last 30 days of records
        const query = \`
            SELECT amount, type, category, date, notes 
            FROM records 
            WHERE user_id = $1 AND date >= NOW() - INTERVAL '30 days'
            ORDER BY date DESC
        \`;
        const { rows: records } = await db.query(query, [targetUserId]);

        if (records.length === 0) {
            return res.json([
                { title: "No Data", description: "Add some financial records in the last 30 days to generate insights.", type: "neutral" }
            ]);
        }

        const totalIncome = records.filter(r => r.type === 'income').reduce((sum, r) => sum + Number(r.amount), 0);
        const totalExpense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + Number(r.amount), 0);

        if (!openai) {
            return res.json([
                { title: "Mock Insight 1", description: \`Your income is $\${totalIncome} and expense is $\${totalExpense}. Great job tracking! Add OPENAI_API_KEY to see real insights.\`, type: "positive" },
                { title: "Mock Insight 2", description: "Consider reducing discretionary spending if you want to save more.", type: "warning" },
                { title: "Mock Insight 3", description: "You have several entries in Food & Dining this month.", type: "neutral" }
            ]);
        }

        const prompt = \`
            Analyze the following financial records for the last 30 days and provide 3 personalized financial insights.
            Total Income: $\${totalIncome}
            Total Expense: $\${totalExpense}
            Records: \${JSON.stringify(records)}
            
            Return exactly a JSON array of 3 objects with the following keys:
            - title (string, short summary)
            - description (string, detailed actionable advice)
            - type (string, one of: "positive", "warning", "neutral")
        \`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: prompt }],
            model: "gpt-3.5-turbo",
            response_format: { type: "json_object" } // Fallback: try parsing JSON
        });

        let insights;
        try {
            // GPT might wrap the array in an object like { "insights": [...] }
            const responseText = completion.choices[0].message.content;
            const parsed = JSON.parse(responseText);
            insights = Array.isArray(parsed) ? parsed : (parsed.insights || []);
            if (insights.length === 0) throw new Error("No insights parsed");
        } catch (e) {
            console.error("Failed to parse OpenAI response:", e);
            return res.status(500).json({ message: "Failed to generate AI insights." });
        }

        res.json(insights);
    } catch (err) {
        console.error("AI Error:", err);
        res.status(500).json({ message: err.message });
    }
};

exports.checkFraud = async (req, res) => {
    const { id, role } = req.user;
    const isAudit = !!req.query.userId;
    const targetUserId = isAudit ? req.query.userId : id;

    try {
        if (role === 'analyst' && isAudit && targetUserId != id) {
            const targetUser = await db.query("SELECT role FROM users WHERE id = $1", [targetUserId]);
            if (targetUser.rows.length > 0 && targetUser.rows[0].role === 'analyst') {
                return res.status(403).json({ message: "Privacy Guard: Analysts cannot audit other analysts." });
            }
        }

        // Rule-based fraud detection
        // Rule 1: Amount > 3x rolling 30-day average expense
        const avgQuery = "SELECT AVG(amount) as avg_amount FROM records WHERE user_id = $1 AND type = 'expense' AND date >= NOW() - INTERVAL '30 days'";
        const avgResult = await db.query(avgQuery, [targetUserId]);
        const avgExpense = Number(avgResult.rows[0].avg_amount) || 0;

        const threshold = avgExpense * 3;

        const suspiciousQuery = "SELECT * FROM records WHERE user_id = $1 AND type = 'expense' AND amount > $2 AND date >= NOW() - INTERVAL '7 days'";
        const { rows: suspiciousRecords } = await db.query(suspiciousQuery, [targetUserId, threshold]);

        const flagged = suspiciousRecords.map(r => ({
            recordId: r.id,
            date: r.date,
            amount: Number(r.amount),
            category: r.category,
            reason: \`Amount ($\${r.amount}) is more than 3x the 30-day average expense ($\${avgExpense.toFixed(2)}).\`
        }));

        res.json({ flagged });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
