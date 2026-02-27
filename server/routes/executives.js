const express = require("express");
const router = express.Router();
const { run, get, all } = require("../db");
const { v4: uuidv4 } = require("uuid");

// GET all executives ordered by sort_order
router.get("/", async (req, res) => {
    try {
        const executives = await all("SELECT * FROM executives ORDER BY sort_order ASC");
        res.json(executives);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - add new executive
router.post("/", async (req, res) => {
    try {
        const { name, member_id, designation, image_url } = req.body;
        const id = uuidv4();
        const maxRow = await get("SELECT MAX(sort_order) as max FROM executives");
        const sort_order = (maxRow.max || 0) + 1;
        await run(
            "INSERT INTO executives (id, name, member_id, designation, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
            [id, name, member_id, designation, image_url, sort_order]
        );
        const exec = await get("SELECT * FROM executives WHERE id = ?", [id]);
        res.status(201).json(exec);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT - update executive by id
router.put("/:id", async (req, res) => {
    try {
        const { name, member_id, designation, image_url } = req.body;
        await run(
            "UPDATE executives SET name = ?, member_id = ?, designation = ?, image_url = ? WHERE id = ?",
            [name, member_id, designation, image_url, req.params.id]
        );
        const exec = await get("SELECT * FROM executives WHERE id = ?", [req.params.id]);
        res.json(exec);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE - remove executive
router.delete("/:id", async (req, res) => {
    try {
        await run("DELETE FROM executives WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /reorder/batch - update sort order for all executives
router.put("/reorder/batch", async (req, res) => {
    try {
        const { order } = req.body; // Array of { id, sort_order }
        for (const item of order) {
            await run("UPDATE executives SET sort_order = ? WHERE id = ?", [item.sort_order, item.id]);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
