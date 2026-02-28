const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { run, get } = require("../db");

// Helper function for password strength validation
function validatePassword(password) {
    if (password.length < 8) return false;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecialOrDigit = /[^A-Za-z0-9]/.test(password) || /[0-9]/.test(password);
    return hasUpper && hasLower && hasSpecialOrDigit;
}

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

module.exports = router;
