const express = require("express");
const router = express.Router();
const { run, get, all } = require("../db");
const { v4: uuidv4 } = require("uuid");

// GET all alumni ordered by year DESC and sort_order ASC
router.get("/", async (req, res) => {
    try {
        const alumni = await all("SELECT * FROM alumni ORDER BY year DESC, sort_order ASC");
        res.json(alumni);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - add new alumni
router.post("/", async (req, res) => {
    try {
        const { year, name, panel_name, linkedin_url, image_url } = req.body;
        const id = uuidv4();
        const maxRow = await get("SELECT MAX(sort_order) as max FROM alumni WHERE year = ?", [year]);
        const sort_order = (maxRow.max || 0) + 1;
        await run(
            "INSERT INTO alumni (id, year, name, panel_name, linkedin_url, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [id, year, name, panel_name, linkedin_url, image_url, sort_order]
        );
        const alumni = await get("SELECT * FROM alumni WHERE id = ?", [id]);
        res.status(201).json(alumni);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT - update alumni by id
router.put("/:id", async (req, res) => {
    try {
        const { year, name, panel_name, linkedin_url, image_url } = req.body;
        await run(
            "UPDATE alumni SET year = ?, name = ?, panel_name = ?, linkedin_url = ?, image_url = ? WHERE id = ?",
            [year, name, panel_name, linkedin_url, image_url, req.params.id]
        );
        const alumni = await get("SELECT * FROM alumni WHERE id = ?", [req.params.id]);
        res.json(alumni);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE - remove alumni
router.delete("/:id", async (req, res) => {
    try {
        await run("DELETE FROM alumni WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /reorder/batch - update sort order for a group of alumni
router.put("/reorder/batch", async (req, res) => {
    try {
        const { order } = req.body; // [{ id, sort_order }]
        for (const item of order) {
            await run("UPDATE alumni SET sort_order = ? WHERE id = ?", [item.sort_order, item.id]);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
