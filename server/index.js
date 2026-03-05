require("dotenv").config();
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
app.use("/api/alumni", require("./routes/alumni"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/teachers", require("./routes/teachers"));
app.use("/api/advisors", require("./routes/advisors"));

app.listen(PORT, () => {
    console.log(`✅ ABC Website backend running on http://localhost:${PORT}`);
    console.log(`📦 Database: PostgreSQL (Neon)`);
});
