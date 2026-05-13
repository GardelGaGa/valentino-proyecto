// backend/routes/sessions.js
// Rutas: POST /api/sessions/start  · PATCH /api/sessions/:id/end
//        GET  /api/sessions/today  · GET   /api/sessions/history

const express = require("express");
const db      = require("../db");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// ── Iniciar sesión de estudio ──────────────────────────────
router.post("/start", verifyToken, (req, res) => {
    const { mode = "focus", planned_min = 25 } = req.body;
    const userId = req.user.id;

    db.query(
        "INSERT INTO study_sessions (user_id, mode, planned_min) VALUES (?, ?, ?)",
        [userId, mode, planned_min],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ session_id: result.insertId, started: true });
        }
    );
});

// ── Cerrar sesión (guarda duración, interrupciones, score) ─
router.patch("/:id/end", verifyToken, (req, res) => {
    const { interruptions = 0, notes = "" } = req.body;
    const sessionId = req.params.id;
    const userId    = req.user.id;

    // focus_score: empieza en 100, resta 10 por cada interrupción, mínimo 0
    const focus_score = Math.max(0, 100 - interruptions * 10);

    db.query(
        `UPDATE study_sessions
         SET ended_at = NOW(), interruptions = ?, focus_score = ?, notes = ?
         WHERE id = ? AND user_id = ?`,
        [interruptions, focus_score, notes, sessionId, userId],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            updateDailyMetrics(userId);
            res.json({ closed: true, focus_score });
        }
    );
});

// ── Sesiones de hoy ────────────────────────────────────────
router.get("/today", verifyToken, (req, res) => {
    const userId = req.user.id;

    db.query(
        `SELECT * FROM study_sessions
         WHERE user_id = ? AND DATE(started_at) = CURDATE()
         ORDER BY started_at DESC`,
        [userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// ── Historial de sesiones ─────────────────────────────────
router.get("/history", verifyToken, (req, res) => {
    const userId = req.user.id;
    const limit  = parseInt(req.query.limit) || 30;

    db.query(
        `SELECT * FROM study_sessions
         WHERE user_id = ?
         ORDER BY started_at DESC
         LIMIT ?`,
        [userId, limit],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// ── Helper: actualizar métricas diarias ────────────────────
function updateDailyMetrics(userId) {
    const today = new Date().toISOString().split("T")[0];

    db.query(
        `SELECT
            COUNT(*) AS sessions_count,
            SUM(TIMESTAMPDIFF(MINUTE, started_at, ended_at)) AS total_min,
            AVG(focus_score) AS avg_score
         FROM study_sessions
         WHERE user_id = ? AND DATE(started_at) = ? AND ended_at IS NOT NULL`,
        [userId, today],
        (err, rows) => {
            if (err || !rows[0]) return;
            const { sessions_count, total_min, avg_score } = rows[0];

            db.query(
                `INSERT INTO productivity_logs
                    (user_id, date, tasks_completed, time_focused, focus_score)
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                    tasks_completed = VALUES(tasks_completed),
                    time_focused    = VALUES(time_focused),
                    focus_score     = VALUES(focus_score)`,
                [userId, today, sessions_count, total_min || 0, Math.round(avg_score || 0)],
                () => {}
            );
        }
    );
}

module.exports = router;
