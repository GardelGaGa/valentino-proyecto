const express = require("express");
const cors    = require("cors");
const path    = require("path");

const app = express();

// ── Middlewares ───────────────────────────────────────────
app.use(cors());
app.use(express.json());

const staticPath = path.join(__dirname, "..");
console.log("Sirviendo estáticos desde:", staticPath);
app.use(express.static(staticPath));
// ── DB ────────────────────────────────────────────────────
require("./db");

// ── Rutas API ─────────────────────────────────────────────
const authRoutes    = require("./routes/auth");
const taskRoutes    = require("./routes/tasks");
const sessionRoutes = require("./routes/sessions");
const focusRoutes   = require("./routes/focus");

app.use("/api/auth",     authRoutes);
app.use("/api/tasks",    taskRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/focus",    focusRoutes);

// ── Fallback: cualquier ruta no-API devuelve index.html ───
app.get("/{*path}", (req, res) => {
    if (!req.path.startsWith("/api")) {
        res.sendFile(path.join(__dirname, "..", "index.html"));
    }
});

// ── Arrancar ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 FocusLab corriendo en http://localhost:${PORT}`);
    console.log(`   Frontend: http://localhost:${PORT}/login.html`);
});