// backend/routes/tasks.js — usa tabla real: tasks (schema focuslab real)
const express = require("express");
const db      = require("../db");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// GET /api/tasks
router.get("/", verifyToken, (req, res) => {
    const userId = req.user.id;
    db.query(
        "SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC",
        [userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// POST /api/tasks
router.post("/", verifyToken, (req, res) => {
    const {
        title, description = "", status = "pendiente",
        priority = "media", session_id = null, due_date = null
    } = req.body;
    const userId = req.user.id;

    if (!title) return res.status(400).json({ error: "El título es requerido" });

    db.query(
        `INSERT INTO tasks (user_id, session_id, title, description, status, priority, due_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, session_id, title, description, status, priority, due_date],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: result.insertId, user_id: userId, session_id,
                title, description, status, priority, due_date
            });
        }
    );
});

// PUT /api/tasks/:id
router.put("/:id", verifyToken, (req, res) => {
    const { title, description, status, priority, due_date } = req.body;
    const taskId = req.params.id;
    const userId = req.user.id;

    // Si cambia a 'hecho', guarda completed_at
    const completedAt = status === "hecho" ? new Date() : null;

    db.query(
        `UPDATE tasks
         SET title       = COALESCE(?, title),
             description = COALESCE(?, description),
             status      = COALESCE(?, status),
             priority    = COALESCE(?, priority),
             due_date    = COALESCE(?, due_date),
             completed_at = CASE WHEN ? = 'hecho' THEN NOW() ELSE completed_at END,
             updated_at  = NOW()
         WHERE id = ? AND user_id = ?`,
        [title, description, status, priority, due_date, status, taskId, userId],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0)
                return res.status(404).json({ error: "Tarea no encontrada" });
            res.json({ updated: true });
        }
    );
});

// DELETE /api/tasks/:id
router.delete("/:id", verifyToken, (req, res) => {
    const taskId = req.params.id;
    const userId = req.user.id;
    db.query(
        "DELETE FROM tasks WHERE id = ? AND user_id = ?",
        [taskId, userId],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0)
                return res.status(404).json({ error: "Tarea no encontrada" });
            res.json({ deleted: true });
        }
    );
});

module.exports = router;