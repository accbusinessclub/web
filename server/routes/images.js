const express = require("express");
const router = express.Router();
const { run, get, all } = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Setup upload folder
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const unique = uuidv4();
        cb(null, unique + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
    fileFilter: function (req, file, cb) {
        const allowed = /jpeg|jpg|png|gif|webp|svg/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) return cb(null, true);
        cb(new Error("Only image files are allowed"));
    },
});

// GET all images ordered by sort_order
router.get("/", async (req, res) => {
    try {
        const images = await all("SELECT * FROM images ORDER BY sort_order ASC, created_at DESC");
        res.json(images);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - upload image file
router.post("/upload", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const id = uuidv4();
        const filename = req.file.filename;
        const url = `/uploads/${filename}`;
        const caption = req.body.caption || "";
        const maxRow = await get("SELECT MAX(sort_order) as max FROM images");
        const sort_order = (maxRow && maxRow.max != null ? maxRow.max : -1) + 1;
        await run(
            "INSERT INTO images (id, filename, url, caption, sort_order) VALUES (?, ?, ?, ?, ?)",
            [id, filename, url, caption, sort_order]
        );
        const image = await get("SELECT * FROM images WHERE id = ?", [id]);
        res.status(201).json(image);
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: err.message });
    }
});

// POST - add image via URL
router.post("/url", async (req, res) => {
    try {
        const id = uuidv4();
        const { url, caption } = req.body;
        const maxRow = await get("SELECT MAX(sort_order) as max FROM images");
        const sort_order = (maxRow && maxRow.max != null ? maxRow.max : -1) + 1;
        await run(
            "INSERT INTO images (id, filename, url, caption, sort_order) VALUES (?, NULL, ?, ?, ?)",
            [id, url, caption || "", sort_order]
        );
        const image = await get("SELECT * FROM images WHERE id = ?", [id]);
        res.status(201).json(image);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE - remove image
router.delete("/:id", async (req, res) => {
    try {
        const image = await get("SELECT * FROM images WHERE id = ?", [req.params.id]);
        if (!image) return res.status(404).json({ error: "Not found" });

        if (image.filename) {
            const filePath = path.join(uploadDir, image.filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await run("DELETE FROM images WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /reorder/batch - update sort order
router.put("/reorder/batch", async (req, res) => {
    try {
        const { order } = req.body; // Array of { id, sort_order }
        for (const item of order) {
            await run("UPDATE images SET sort_order = ? WHERE id = ?", [item.sort_order, item.id]);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
