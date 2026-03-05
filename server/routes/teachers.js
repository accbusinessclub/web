const express = require("express");
const router = express.Router();
const { run, get, all } = require("../db");
const { v4: uuidv4 } = require("uuid");

// GET all teachers ordered by sort_order
router.get("/", async (req, res) => {
    try {
        const teachers = await all("SELECT * FROM teachers ORDER BY sort_order ASC, name ASC");
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - add new teacher
router.post("/", async (req, res) => {
    try {
        const { name, designation, department, role, image_url } = req.body;
        const id = uuidv4();
        const maxRow = await get("SELECT MAX(sort_order) as max FROM teachers");
        const sort_order = (maxRow?.max || 0) + 1;
        await run(
            "INSERT INTO teachers (id, name, designation, department, role, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [id, name, designation || "", department || "", role || "teacher", image_url || "", sort_order]
        );
        const created = await get("SELECT * FROM teachers WHERE id = ?", [id]);
        res.status(201).json(created);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT - update teacher
router.put("/:id", async (req, res) => {
    try {
        const { name, designation, department, role, image_url } = req.body;
        await run(
            "UPDATE teachers SET name = ?, designation = ?, department = ?, role = ?, image_url = ? WHERE id = ?",
            [name, designation || "", department || "", role || "teacher", image_url || "", req.params.id]
        );
        const updated = await get("SELECT * FROM teachers WHERE id = ?", [req.params.id]);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE
router.delete("/:id", async (req, res) => {
    try {
        await run("DELETE FROM teachers WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /reorder/batch
router.put("/reorder/batch", async (req, res) => {
    try {
        const { order } = req.body;
        for (const item of order) {
            await run("UPDATE teachers SET sort_order = ? WHERE id = ?", [item.sort_order, item.id]);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
