const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { run, get } = require("../db");

// ─── In-memory brute-force rate limiter ───────────────────────────────────────
const MAX_ATTEMPTS = 3;          // lockout after this many failures
const WINDOW_MS = 15 * 60 * 1000; // 15-minute window

// Map<ip, { count: number, firstFail: number }>
const loginAttempts = new Map();

function getRateLimitInfo(ip) {
    const now = Date.now();
    const entry = loginAttempts.get(ip);

    if (!entry) return { blocked: false, remaining: MAX_ATTEMPTS };

    // Window expired → reset
    if (now - entry.firstFail >= WINDOW_MS) {
        loginAttempts.delete(ip);
        return { blocked: false, remaining: MAX_ATTEMPTS };
    }

    if (entry.count >= MAX_ATTEMPTS) {
        const retryAfterMs = WINDOW_MS - (now - entry.firstFail);
        return { blocked: true, retryAfterSec: Math.ceil(retryAfterMs / 1000) };
    }

    return { blocked: false, remaining: MAX_ATTEMPTS - entry.count };
}

function recordFailure(ip) {
    const now = Date.now();
    const entry = loginAttempts.get(ip);
    if (!entry || Date.now() - entry.firstFail >= WINDOW_MS) {
        loginAttempts.set(ip, { count: 1, firstFail: now });
    } else {
        entry.count += 1;
    }
}

function resetAttempts(ip) {
    loginAttempts.delete(ip);
}
// ──────────────────────────────────────────────────────────────────────────────

// Helper function for password strength validation
function validatePassword(password) {
    if (password.length < 8) return false;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecialOrDigit = /[^A-Za-z0-9]/.test(password) || /[0-9]/.test(password);
    return hasUpper && hasLower && hasSpecialOrDigit;
}

// 1. Login route using bcrypt + rate limiting
router.post("/login", async (req, res) => {
    const ip = req.ip || req.connection.remoteAddress || "unknown";
    const info = getRateLimitInfo(ip);

    if (info.blocked) {
        return res.status(429).json({
            success: false,
            message: `Too many failed attempts. Try again in ${info.retryAfterSec} seconds.`,
            retryAfterSec: info.retryAfterSec,
        });
    }

    try {
        const { username, password } = req.body;
        const dbUser = await get("SELECT value FROM settings WHERE key = 'admin_username'");
        const dbPass = await get("SELECT value FROM settings WHERE key = 'admin_password'");

        if (!dbUser || !dbPass) {
            return res.status(500).json({ success: false, message: "Database error." });
        }

        if (dbUser.value === username) {
            const isMatch = await bcrypt.compare(password, dbPass.value);
            if (isMatch) {
                resetAttempts(ip);
                return res.json({ success: true, token: "admin-token-accbc" });
            }
        }

        recordFailure(ip);
        const updatedInfo = getRateLimitInfo(ip);

        if (updatedInfo.blocked) {
            return res.status(429).json({
                success: false,
                message: `Too many failed attempts. Try again in ${updatedInfo.retryAfterSec} seconds.`,
                retryAfterSec: updatedInfo.retryAfterSec,
            });
        }

        res.status(401).json({
            success: false,
            message: "Invalid credentials",
            attemptsLeft: updatedInfo.remaining,
        });
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
