const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

const SECRET = "focuslab_secret_key";

/* =========================
   REGISTER
========================= */
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hash],
        (err) => {
            if (err) return res.json({ error: err });
            res.json({ message: "Usuario creado" });
        }
    );
});

/* =========================
   LOGIN
========================= */
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, result) => {

            if (err || result.length === 0) {
                return res.json({ error: "Usuario no existe" });
            }

            const user = result[0];

            const valid = await bcrypt.compare(password, user.password);

            if (!valid) {
                return res.json({ error: "Password incorrecto" });
            }

            const token = jwt.sign(
                { id: user.id, name: user.name },
                SECRET,
                { expiresIn: "1d" }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });
        }
    );
});

module.exports = router;