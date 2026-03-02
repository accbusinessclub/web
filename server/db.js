const { Pool } = require("pg");
require("dotenv").config();

// PostgreSQL connection pool
// For local development, it will read from your .env file
// For Render, you will add it as an Environment Variable in the dashboard
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Helper for converting SQLite '?' placeholders to PostgreSQL '$1', '$2', etc.
function convertPlaceholders(sql) {
    let count = 1;
    return sql.replace(/\?/g, () => `$${count++}`);
}

async function run(sql, params = []) {
    const pgSql = convertPlaceholders(sql);
    try {
        const result = await pool.query(pgSql, params);
        return { lastID: null, changes: result.rowCount }; // PostgreSQL doesn't have lastID like SQLite in simple queries
    } catch (err) {
        console.error("❌ Database query error:", err.message);
        throw err;
    }
}

async function get(sql, params = []) {
    const pgSql = convertPlaceholders(sql);
    try {
        const result = await pool.query(pgSql, params);
        return result.rows[0];
    } catch (err) {
        console.error("❌ Database query error:", err.message);
        throw err;
    }
}

async function all(sql, params = []) {
    const pgSql = convertPlaceholders(sql);
    try {
        const result = await pool.query(pgSql, params);
        return result.rows;
    } catch (err) {
        console.error("❌ Database query error:", err.message);
        throw err;
    }
}

async function initDB() {
    try {
        // Table creation for PostgreSQL
        await run(`CREATE TABLE IF NOT EXISTS executives (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            member_id TEXT NOT NULL,
            designation TEXT NOT NULL,
            image_url TEXT NOT NULL,
            sort_order INTEGER NOT NULL DEFAULT 0
        )`);

        await run(`CREATE TABLE IF NOT EXISTS hero (
            id SERIAL PRIMARY KEY,
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
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`);

        await run(`CREATE TABLE IF NOT EXISTS alumni (
            id TEXT PRIMARY KEY,
            year TEXT NOT NULL,
            name TEXT NOT NULL,
            panel_name TEXT NOT NULL,
            linkedin_url TEXT,
            image_url TEXT,
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`);

        // Check if sort_order column exists in images (PostgreSQL specific check)
        try {
            await run("ALTER TABLE images ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0");
        } catch (_) { /* column might already exist or command might fail if not supported, ignore */ }

        await run(`CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )`);

        // Seed executives
        const execCount = await get("SELECT COUNT(*) as count FROM executives");
        if (parseInt(execCount.count) === 0) {
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
        if (parseInt(heroCount.count) === 0) {
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

        const bcrypt = require("bcryptjs");

        // Seed default footer contact & social settings
        const footerDefaults = [
            ["footer_phone", ""],
            ["footer_email", "abc@acc.edu.bd"],
            ["footer_facebook", "https://facebook.com/accbc"],
            ["footer_instagram", "https://instagram.com/accbc"],
            ["footer_linkedin", "https://linkedin.com/company/accbc"],
            ["footer_email_icon", "mailto:abc@acc.edu.bd"],
            ["admin_username", "admin"],
        ];
        for (const [key, value] of footerDefaults) {
            const existing = await get("SELECT value FROM settings WHERE key = ?", [key]);
            if (!existing) {
                await run("INSERT INTO settings (key, value) VALUES (?, ?)", [key, value]);
            }
        }

        // Process admin password separately to hash it
        const existingPass = await get("SELECT value FROM settings WHERE key = 'admin_password'");
        if (!existingPass) {
            const hashedP = await bcrypt.hash("accbc2024", 10);
            await run("INSERT INTO settings (key, value) VALUES ('admin_password', ?)", [hashedP]);
        } else if (existingPass.value === "accbc2024") {
            const hashedP = await bcrypt.hash("accbc2024", 10);
            await run("UPDATE settings SET value = ? WHERE key = 'admin_password'", [hashedP]);
        }

        // Seed default gallery images
        const imgCount = await get("SELECT COUNT(*) as count FROM images");
        if (parseInt(imgCount.count) === 0) {
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

        console.log("✅ Database initialized on PostgreSQL with default data");
    } catch (err) {
        console.error("❌ Database initialization error:", err.message);
    }
}

// Initial connection and initialization
pool.connect((err) => {
    if (err) {
        console.error("❌ Failed to connect to PostgreSQL database:", err.message);
    } else {
        console.log("📦 Connected to PostgreSQL database");
        initDB();
    }
});

module.exports = { run, get, all };
