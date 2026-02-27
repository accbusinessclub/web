const express = require("express");
const router = express.Router();
const { run, get } = require("../db");

// GET a setting by key
router.get("/:key", async (req, res) => {
    try {
        const row = await get("SELECT value FROM settings WHERE key = ?", [req.params.key]);
        if (!row) return res.status(404).json({ error: "Setting not found" });
        res.json({ key: req.params.key, value: row.value });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT - update a setting by key
router.put("/:key", async (req, res) => {
    try {
        const { value } = req.body;
        await run(
            "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            [req.params.key, value]
        );
        res.json({ key: req.params.key, value });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
