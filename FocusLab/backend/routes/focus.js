const express = require("express");
const db      = require("../db");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// ── POST /api/focus/start — iniciar sesión de focus ───────
router.post("/start", verifyToken, (req, res) => {
    const userId = req.user.id;

    db.query(
        "INSERT INTO focus_sessions (user_id, start_time) VALUES (?, NOW())",
        [userId],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ session_id: result.insertId, started: true });
        }
    );
});

// ── PATCH /api/focus/:id/end — finalizar sesión ───────────
router.patch("/:id/end", verifyToken, (req, res) => {
    const { interruptions = 0, deep_work_score = 0 } = req.body;
    const sessionId = req.params.id;
    const userId    = req.user.id;

    db.query(
        `UPDATE focus_sessions
         SET end_time = NOW(), interruptions = ?, deep_work_score = ?
         WHERE id = ? AND user_id = ?`,
        [interruptions, deep_work_score, sessionId, userId],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0)
                return res.status(404).json({ error: "Sesión no encontrada" });
            res.json({ closed: true });
        }
    );
});

// ── GET /api/focus — historial de sesiones de focus ───────
router.get("/", verifyToken, (req, res) => {
    const userId = req.user.id;

    db.query(
        `SELECT id, start_time, end_time, interruptions, deep_work_score,
                TIMESTAMPDIFF(MINUTE, start_time, end_time) AS duration_min
         FROM focus_sessions
         WHERE user_id = ?
         ORDER BY start_time DESC
         LIMIT 20`,
        [userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// ── GET /api/focus/stats — stats de hoy ───────────────────
router.get("/stats", verifyToken, (req, res) => {
    const userId = req.user.id;

    db.query(
        `SELECT
            COUNT(*) AS sessions_today,
            SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)) AS total_min,
            AVG(deep_work_score) AS avg_score,
            SUM(interruptions)   AS total_interruptions
         FROM focus_sessions
         WHERE user_id = ? AND DATE(start_time) = CURDATE() AND end_time IS NOT NULL`,
        [userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows[0] || { sessions_today: 0, total_min: 0, avg_score: 0, total_interruptions: 0 });
        }
    );
});

module.exports = router;
