const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = path.join(__dirname, "database.sqlite");

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error("❌ Failed to open database:", err.message);
    } else {
        console.log("📦 Connected to SQLite database");
        initDB();
    }
});

function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function initDB() {
    await run(`CREATE TABLE IF NOT EXISTS executives (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    member_id TEXT NOT NULL,
    designation TEXT NOT NULL,
    image_url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`);

    await run(`CREATE TABLE IF NOT EXISTS hero (
    id INTEGER PRIMARY KEY,
    title_line1 TEXT NOT NULL,
    title_line2 TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    btn1_text TEXT NOT NULL,
    btn2_text TEXT NOT NULL
  )`);

    await run(`CREATE TABLE IF NOT EXISTS images (
    id TEXT PRIMARY KEY,
    filename TEXT,
    url TEXT NOT NULL,
    caption TEXT DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

    // Add sort_order column to existing images table if it doesn't exist yet
    try {
        await run("ALTER TABLE images ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0");
    } catch (_) { /* column already exists, ignore */ }

    await run(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);

    // Seed executives
    const execCount = await get("SELECT COUNT(*) as count FROM executives");
    if (execCount.count === 0) {
        const defaults = [
            ["1", "Fahim Ahmed", "ACC-2023-001", "President", "https://images.unsplash.com/photo-1623880840102-7df0a9f3545b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", 1],
            ["2", "Sadia Rahman", "ACC-2023-012", "Vice President", "https://images.unsplash.com/photo-1765648636207-22c892e8fae9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", 2],
            ["3", "Rashed Khan", "ACC-2023-024", "General Secretary", "https://images.unsplash.com/photo-1584940120505-117038d90b05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", 3],
            ["4", "Ayesha Sultana", "ACC-2023-035", "Finance Secretary", "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", 4],
            ["5", "Nafia Hasan", "ACC-2023-047", "Event Coordinator", "https://images.unsplash.com/photo-1589220286904-3dcef62c68ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", 5],
            ["6", "Tanvir Hossain", "ACC-2023-058", "Media & PR Head", "https://images.unsplash.com/photo-1770894807442-108cc33c0a7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", 6],
        ];
        for (const d of defaults) {
            await run("INSERT INTO executives (id, name, member_id, designation, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)", d);
        }
    }

    // Seed hero
    const heroCount = await get("SELECT COUNT(*) as count FROM hero");
    if (heroCount.count === 0) {
        await run(
            "INSERT INTO hero (id, title_line1, title_line2, subtitle, btn1_text, btn2_text) VALUES (1, ?, ?, ?, ?, ?)",
            [
                "Adamjee Cantonment College",
                "Business Club",
                "Empowering Tomorrow's Leaders Through Innovation, Excellence, and Collaboration",
                "Join the Club",
                "Explore Events",
            ]
        );
    }

    // Seed default settings
    const regLink = await get("SELECT value FROM settings WHERE key = 'registration_link'");
    if (!regLink) {
        await run("INSERT INTO settings (key, value) VALUES ('registration_link', 'https://forms.google.com/')");
    }

    // Seed default footer contact & social settings
    const footerDefaults = [
        ["footer_phone", ""],
        ["footer_email", "abc@acc.edu.bd"],
        ["footer_facebook", "https://facebook.com/accbc"],
        ["footer_instagram", "https://instagram.com/accbc"],
        ["footer_linkedin", "https://linkedin.com/company/accbc"],
        ["footer_email_icon", "mailto:abc@acc.edu.bd"],
    ];
    for (const [key, value] of footerDefaults) {
        const existing = await get("SELECT value FROM settings WHERE key = ?", [key]);
        if (!existing) {
            await run("INSERT INTO settings (key, value) VALUES (?, ?)", [key, value]);
        }
    }

    // Seed default gallery images
    const imgCount = await get("SELECT COUNT(*) as count FROM images");
    if (imgCount.count === 0) {
        const defaultImages = [
            ["img-d1", "https://images.unsplash.com/photo-1770364292936-1800aa621b3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", "Annual Business Summit 2025", 0],
            ["img-d2", "https://images.unsplash.com/photo-1747674148491-51f8a5c723db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", "Leadership Seminar", 1],
            ["img-d3", "https://images.unsplash.com/photo-1768796370407-6d36619e7d6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", "Workshop on Entrepreneurship", 2],
            ["img-d4", "https://images.unsplash.com/photo-1696798559340-ad395e783816?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", "Networking Event", 3],
            ["img-d5", "https://images.unsplash.com/photo-1762968269894-1d7e1ce8894e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", "Guest Speaker Session", 4],
            ["img-d6", "https://images.unsplash.com/photo-1758270705518-b61b40527e76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", "Team Discussion", 5],
        ];
        for (const [id, url, caption, sort_order] of defaultImages) {
            await run(
                "INSERT INTO images (id, filename, url, caption, sort_order) VALUES (?, NULL, ?, ?, ?)",
                [id, url, caption, sort_order]
            );
        }
    }

    console.log("✅ Database initialized with default data");
}

module.exports = { db, run, get, all };
