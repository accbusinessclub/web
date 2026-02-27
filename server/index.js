const express = require("express");
const cors = require("cors");
const path = require("path");

// Initialize DB (creates tables + seeds data)
require("./db");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/executives", require("./routes/executives"));
app.use("/api/hero", require("./routes/hero"));
app.use("/api/images", require("./routes/images"));
app.use("/api/settings", require("./routes/settings"));

// Auth endpoint
app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "accbc202") {
        res.json({ success: true, token: "admin-token-accbc" });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ ABC Website backend running on http://localhost:${PORT}`);
    console.log(`📦 Database: server/database.sqlite`);
    console.log(`🖼️  Uploads: server/uploads/`);
});
