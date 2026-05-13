// backend/routes/focus.js  — usa tabla real: study_sessions (con mode='focus')
const express = require("express");
const db      = require("../db");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// POST /api/focus/start
router.post("/start", verifyToken, (req, res) => {
    const { planned_min = 25 } = req.body;
    const userId = req.user.id;
    db.query(
        "INSERT INTO study_sessions (user_id, mode, planned_min) VALUES (?, 'focus', ?)",
        [userId, planned_min],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ session_id: result.insertId, started: true });
        }
    );
});

// PATCH /api/focus/:id/end
router.patch("/:id/end", verifyToken, (req, res) => {
    const { interruptions = 0, notes = "" } = req.body;
    const sessionId = req.params.id;
    const userId    = req.user.id;
    const focus_score = Math.max(0, 100 - interruptions * 10);
    db.query(
        `UPDATE study_sessions
         SET ended_at = NOW(),
             duration_sec = TIMESTAMPDIFF(SECOND, started_at, NOW()),
             interruptions = ?, focus_score = ?, notes = ?
         WHERE id = ? AND user_id = ? AND mode = 'focus'`,
        [interruptions, focus_score, notes, sessionId, userId],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0)
                return res.status(404).json({ error: "Sesión no encontrada" });
            res.json({ closed: true, focus_score });
        }
    );
});

// GET /api/focus — historial de sesiones de focus
router.get("/", verifyToken, (req, res) => {
    const userId = req.user.id;
    db.query(
        `SELECT id, started_at AS start_time, ended_at AS end_time,
                interruptions, focus_score AS deep_work_score,
                FLOOR(duration_sec / 60) AS duration_min
         FROM study_sessions
         WHERE user_id = ? AND mode = 'focus'
         ORDER BY started_at DESC LIMIT 20`,
        [userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// GET /api/focus/stats
router.get("/stats", verifyToken, (req, res) => {
    const userId = req.user.id;
    db.query(
        `SELECT COUNT(*) AS sessions_today,
                COALESCE(SUM(FLOOR(duration_sec/60)),0) AS total_min,
                COALESCE(AVG(focus_score),0)            AS avg_score,
                COALESCE(SUM(interruptions),0)          AS total_interruptions
         FROM study_sessions
         WHERE user_id = ? AND DATE(started_at) = CURDATE() AND ended_at IS NOT NULL`,
        [userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows[0] || { sessions_today: 0, total_min: 0, avg_score: 0, total_interruptions: 0 });
        }
    );
});

module.exports = router;