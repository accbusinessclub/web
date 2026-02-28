const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { run, get } = require("../db");

// Simple generated OTP storage (in-memory for now, expires in 10 mins)
const otpStore = new Map();
// Stores { email: { otp: "123456", expiresAt: timestamp } }

// Helper function for password strength validation
function validatePassword(password) {
    if (password.length < 8) return false;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecialOrDigit = /[^A-Za-z0-9]/.test(password) || /[0-9]/.test(password);
    return hasUpper && hasLower && hasSpecialOrDigit;
}

// Nodemailer transport setup
// Expects environment variables for secure usage
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 1. Login route using bcrypt
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const dbUser = await get("SELECT value FROM settings WHERE key = 'admin_username'");
        const dbPass = await get("SELECT value FROM settings WHERE key = 'admin_password'");

        if (!dbUser || !dbPass) {
            return res.status(500).json({ success: false, message: "Database error." });
        }

        if (dbUser.value === username) {
            // Compare the plain text password from request with hashed password in DB
            const isMatch = await bcrypt.compare(password, dbPass.value);
            if (isMatch) {
                return res.json({ success: true, token: "admin-token-accbc" });
            }
        }

        res.status(401).json({ success: false, message: "Invalid credentials" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Change Password route using bcrypt
router.put("/password", async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const dbPass = await get("SELECT value FROM settings WHERE key = 'admin_password'");

        const isMatch = await bcrypt.compare(currentPassword, dbPass.value);
        if (!isMatch) {
            return res.status(400).json({ error: "Current password is incorrect" });
        }

        if (!validatePassword(newPassword)) {
            return res.status(400).json({
                error: "Password must be 8+ characters and contain upper, lower, and at least one symbol or number."
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await run("UPDATE settings SET value = ? WHERE key = 'admin_password'", [hashedPassword]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Request OTP for Forgot Password
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        // Ensure email matches configured RECOVERY_EMAIL
        const recoveryEmail = process.env.RECOVERY_EMAIL;

        if (!recoveryEmail) {
            return res.status(500).json({ error: "Server recovery email is not configured." });
        }

        if (email.toLowerCase() !== recoveryEmail.toLowerCase()) {
            return res.status(400).json({ error: "Invalid recovery email address." });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        otpStore.set(email.toLowerCase(), { otp, expiresAt });

        // Send Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'ACCBC Admin - Password Recovery OTP',
            html: `
                <h3>Hello Admin,</h3>
                <p>We received a request to reset your ACCBC Admin Panel password.</p>
                <p>Your OTP code is: <strong>${otp}</strong></p>
                <p>This code will expire in 10 minutes.</p>
                <br>
                <p>If you did not request this, please ignore this email.</p>
            `
        };

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail(mailOptions);
        } else {
            console.warn("⚠️ Nodemailer not configured: EMAIL_USER or EMAIL_PASS missing. Printing OTP to console for debugging.");
            console.log("OTP for", email, ":", otp);
            // We simulate success here so dev testing is possible without emails
            // But log a warning
        }

        res.json({ success: true, message: "OTP sent to recovery email." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to send OTP email." });
    }
});

// 4. Verify OTP
router.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;
        const record = otpStore.get(email.toLowerCase());

        if (!record) {
            return res.status(400).json({ error: "No OTP request found for this email." });
        }

        if (Date.now() > record.expiresAt) {
            otpStore.delete(email.toLowerCase());
            return res.status(400).json({ error: "OTP has expired. Please request a new one." });
        }

        if (record.otp !== otp) {
            return res.status(400).json({ error: "Invalid OTP." });
        }

        // OTP is valid. Store a temporary flag allowing reset for 10 mins
        record.verified = true;
        // Extend expiration
        record.expiresAt = Date.now() + 10 * 60 * 1000;
        otpStore.set(email.toLowerCase(), record);

        res.json({ success: true, message: "OTP verified." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Reset Password (after OTP verification)
router.post("/reset-password", async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const record = otpStore.get(email.toLowerCase());

        if (!record || !record.verified || Date.now() > record.expiresAt) {
            return res.status(400).json({ error: "Verification session expired. Please restart the recovery process." });
        }

        if (!validatePassword(newPassword)) {
            return res.status(400).json({
                error: "Password must be 8+ characters and contain upper, lower, and at least one symbol or number."
            });
        }

        // Hash and save new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await run("UPDATE settings SET value = ? WHERE key = 'admin_password'", [hashedPassword]);

        // Clear OTP record
        otpStore.delete(email.toLowerCase());

        res.json({ success: true, message: "Password reset successful." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
