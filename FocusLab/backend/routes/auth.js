const express  = require("express");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const db       = require("../db");
const { SECRET } = require("../middleware/auth");

const router = express.Router();

// ── Registro ──────────────────────────────────────────────
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
        return res.status(400).json({ error: "Faltan campos" });

    try {
        const hash = await bcrypt.hash(password, 10);

        db.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hash],
            (err) => {
                if (err) {
                    // Email duplicado
                    if (err.code === "ER_DUP_ENTRY")
                        return res.status(409).json({ error: "El email ya está registrado" });
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: "Usuario creado correctamente" });
            }
        );
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ── Login ─────────────────────────────────────────────────
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: "Faltan campos" });

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, result) => {
            if (err)   return res.status(500).json({ error: err.message });
            if (!result.length)
                return res.status(400).json({ error: "Email no registrado" });

            const user  = result[0];
            const valid = await bcrypt.compare(password, user.password);

            if (!valid)
                return res.status(400).json({ error: "Contraseña incorrecta" });

            const token = jwt.sign(
                { id: user.id, name: user.name, email: user.email },
                SECRET,
                { expiresIn: "1d" }
            );

            res.json({
                token,
                user: { id: user.id, name: user.name, email: user.email }
            });
        }
    );
});

module.exports = router;
