const express = require("express");
const cors    = require("cors");

const app = express();

// ── Middlewares ───────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── DB (importar para verificar conexión al arrancar) ─────
require("./db");

// ── Rutas ─────────────────────────────────────────────────
const authRoutes     = require("./routes/auth");
const taskRoutes     = require("./routes/tasks");
const sessionRoutes  = require("./routes/sessions");
const focusRoutes    = require("./routes/focus");

app.use("/api/auth",     authRoutes);
app.use("/api/tasks",    taskRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/focus",    focusRoutes);

// ── Health check ──────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({ status: "ok", message: "FocusLab backend funcionando 🚀" });
});

// ── Arrancar ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
