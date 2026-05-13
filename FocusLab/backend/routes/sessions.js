// backend/routes/sessions.js  — usa tablas reales: study_sessions + daily_metrics
const express = require("express");
const db      = require("../db");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// POST /api/sessions/start
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

// PATCH /api/sessions/:id/end
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
         WHERE id = ? AND user_id = ?`,
        [interruptions, focus_score, notes, sessionId, userId],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            updateDailyMetrics(userId);
            res.json({ closed: true, focus_score });
        }
    );
});

// GET /api/sessions/today
router.get("/today", verifyToken, (req, res) => {
    const userId = req.user.id;
    db.query(
        "SELECT * FROM study_sessions WHERE user_id = ? AND DATE(started_at) = CURDATE() ORDER BY started_at DESC",
        [userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// GET /api/sessions/history
router.get("/history", verifyToken, (req, res) => {
    const userId = req.user.id;
    const limit  = parseInt(req.query.limit) || 30;
    db.query(
        "SELECT * FROM study_sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT ?",
        [userId, limit],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

function updateDailyMetrics(userId) {
    const today = new Date().toISOString().split("T")[0];
    db.query(
        `SELECT COUNT(*) AS ts, COALESCE(SUM(FLOOR(duration_sec/60)),0) AS tf,
                COALESCE(SUM(interruptions),0) AS ti, COALESCE(AVG(focus_score),0) AS af,
                COALESCE(MAX(FLOOR(duration_sec/60)),0) AS bm
         FROM study_sessions WHERE user_id = ? AND DATE(started_at) = ? AND ended_at IS NOT NULL`,
        [userId, today],
        (err, rows) => {
            if (err || !rows[0]) return;
            const r = rows[0];
            db.query(
                `INSERT INTO daily_metrics (user_id, date, total_focus_min, total_sessions,
                  total_breaks, total_interruptions, avg_focus_score, best_block_min)
                 VALUES (?,?,?,?,?,?,?,?)
                 ON DUPLICATE KEY UPDATE
                  total_focus_min=VALUES(total_focus_min), total_sessions=VALUES(total_sessions),
                  total_breaks=VALUES(total_breaks), total_interruptions=VALUES(total_interruptions),
                  avg_focus_score=VALUES(avg_focus_score), best_block_min=VALUES(best_block_min)`,
                [userId, today, r.tf, r.ts, r.ts, r.ti, Math.round(r.af), r.bm],
                () => {}
            );
        }
    );
}

module.exports = router;