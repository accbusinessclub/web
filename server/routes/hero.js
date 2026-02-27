const express = require("express");
const router = express.Router();
const { run, get } = require("../db");

// GET hero data
router.get("/", async (req, res) => {
    try {
        const hero = await get("SELECT * FROM hero WHERE id = 1");
        res.json(hero);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT - update hero
router.put("/", async (req, res) => {
    try {
        const { title_line1, title_line2, subtitle, btn1_text, btn2_text } = req.body;
        await run(
            "UPDATE hero SET title_line1 = ?, title_line2 = ?, subtitle = ?, btn1_text = ?, btn2_text = ? WHERE id = 1",
            [title_line1, title_line2, subtitle, btn1_text, btn2_text]
        );
        const hero = await get("SELECT * FROM hero WHERE id = 1");
        res.json(hero);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
