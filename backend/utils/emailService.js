const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_USER || "user",
      pass: process.env.SMTP_PASS || "pass"
    }
});

async function sendWelcomeEmail(user) {
    try {
        await transporter.sendMail({
            from: '"LukWealth Admin" <admin@lukwealth.com>',
            to: user.email,
            subject: "Welcome to LukWealth - Registration Received",
            html: `<h3>Hello ${user.name},</h3><p>Your registration has been received. Your account is currently <strong>pending approval</strong> by an Administrator.</p>`
        });
    } catch (err) {
        console.error("Email error:", err);
    }
}

async function sendApprovalEmail(user) {
    try {
        await transporter.sendMail({
            from: '"LukWealth Admin" <admin@lukwealth.com>',
            to: user.email,
            subject: "Account Approved - LukWealth",
            html: `<h3>Hello ${user.name},</h3><p>Good news! Your account has been approved. You can now log in and start tracking your finances.</p>`
        });
    } catch (err) {
        console.error("Email error:", err);
    }
}

async function sendSuspensionEmail(user) {
    try {
        await transporter.sendMail({
            from: '"LukWealth Admin" <admin@lukwealth.com>',
            to: user.email,
            subject: "Account Suspended - LukWealth",
            html: `<h3>Hello ${user.name},</h3><p>Your account has been suspended. Please contact an administrator for more details.</p>`
        });
    } catch (err) {
        console.error("Email error:", err);
    }
}

async function sendPasswordResetEmail(user, token) {
    try {
        const resetLink = \`http://localhost:5173/reset-password?token=\${token}\`;
        await transporter.sendMail({
            from: '"LukWealth Admin" <admin@lukwealth.com>',
            to: user.email,
            subject: "Password Reset Request",
            html: \`<h3>Hello \${user.name},</h3><p>Click <a href="\${resetLink}">here</a> to reset your password. This link expires in 15 minutes.</p>\`
        });
    } catch (err) {
        console.error("Email error:", err);
    }
}

module.exports = {
    sendWelcomeEmail,
    sendApprovalEmail,
    sendSuspensionEmail,
    sendPasswordResetEmail
};
