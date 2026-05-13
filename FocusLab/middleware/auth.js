const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "focuslab_secret_key";

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
