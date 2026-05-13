const express = require("express");
const db      = require("../db");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// ── GET /api/tasks — todas las tareas del usuario ─────────
router.get("/", verifyToken, (req, res) => {
    const userId = req.user.id;

    db.query(
        `SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC`,
        [userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// ── POST /api/tasks — crear tarea ─────────────────────────
router.post("/", verifyToken, (req, res) => {
    const { title, description = "", status = "pendiente", priority = "media" } = req.body;
    const userId = req.user.id;

    if (!title) return res.status(400).json({ error: "El título es requerido" });

    db.query(
        `INSERT INTO tasks (user_id, title, description, status, priority)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, title, description, status, priority],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: result.insertId,
                user_id: userId,
                title, description, status, priority
            });
        }
    );
});

// ── PUT /api/tasks/:id — editar tarea ─────────────────────
router.put("/:id", verifyToken, (req, res) => {
    const { title, description, status, priority } = req.body;
    const taskId = req.params.id;
    const userId = req.user.id;

    db.query(
        `UPDATE tasks
         SET title = COALESCE(?, title),
             description = COALESCE(?, description),
             status = COALESCE(?, status),
             priority = COALESCE(?, priority)
         WHERE id = ? AND user_id = ?`,
        [title, description, status, priority, taskId, userId],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0)
                return res.status(404).json({ error: "Tarea no encontrada" });
            res.json({ updated: true });
        }
    );
});

// ── DELETE /api/tasks/:id — borrar tarea ──────────────────
router.delete("/:id", verifyToken, (req, res) => {
    const taskId = req.params.id;
    const userId = req.user.id;

    db.query(
        `DELETE FROM tasks WHERE id = ? AND user_id = ?`,
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
