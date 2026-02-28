const express = require("express");
const router = express.Router();
const { run, get } = require("../db");

// Helper function for password strength validation
function validatePassword(password) {
    if (password.length < 8) return false;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_]/.test(password) || /[0-9]/.test(password); // alphanumeric sign: user said 1 upper, lower, and alphanumeric sign. Usually means special char + digits.
    // user's exact wording was "atleast 1 upper, lower case, slphsneumericl sign" which I think is special char/digits.
    // actually, slphsneumericl might mean alphanumeric but let's assume we need a special character to be "secure".
    // I'll be more strict with 8 characters + upper + lower + special or digit.
    return hasUpper && hasLower && /[^A-Za-z0-9]/.test(password) && /[0-9]/.test(password); // Let's go strict: upper, lower, symbol, and digit.
}

// Login route using database
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const dbUser = await get("SELECT value FROM settings WHERE key = 'admin_username'");
        const dbPass = await get("SELECT value FROM settings WHERE key = 'admin_password'");

        if (dbUser.value === username && dbPass.value === password) {
            res.json({ success: true, token: "admin-token-accbc" });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Change Password route
router.put("/password", async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const dbPass = await get("SELECT value FROM settings WHERE key = 'admin_password'");

        if (dbPass.value !== currentPassword) {
            return res.status(400).json({ error: "Current password is incorrect" });
        }

        // Validate new password strength
        const hasUpper = /[A-Z]/.test(newPassword);
        const hasLower = /[a-z]/.test(newPassword);
        const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
        const hasDigit = /[0-9]/.test(newPassword);

        if (newPassword.length < 8 || !hasUpper || !hasLower || (!hasSpecial && !hasDigit)) {
            return res.status(400).json({
                error: "Password must be 8+ characters and contain upper, lower, and at least one symbol or number."
            });
        }

        await run("UPDATE settings SET value = ? WHERE key = 'admin_password'", [newPassword]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
