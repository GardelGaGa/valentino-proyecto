// ============================================================
//  backend/middleware/auth.js
//  Poner este archivo en: backend/middleware/auth.js
// ============================================================
const jwt = require("jsonwebtoken");
const SECRET = "focuslab_secret_key"; // en producción usá process.env.JWT_SECRET

function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

    if (!token) return res.status(401).json({ error: "Token requerido" });

    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Token inválido o expirado" });
        req.user = user;
        next();
    });
}

module.exports = { verifyToken, SECRET };


// ============================================================
//  backend/routes/auth.js  (reemplaza el original)
// ============================================================
/*
const express = require("express");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const db      = require("../db");
const { SECRET } = require("../middleware/auth");

const router = express.Router();

// REGISTRO
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
                if (err) return res.json({ error: err });
                res.json({ message: "Usuario creado" });
            }
        );
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// LOGIN — devuelve JWT
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
        if (err || result.length === 0)
            return res.json({ error: "Usuario no existe" });

        const user  = result[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.json({ error: "Password incorrecto" });

        const token = jwt.sign({ id: user.id, name: user.name }, SECRET, { expiresIn: "1d" });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    });
});

module.exports = router;
*/