const mysql = require("mysql2");

// Usamos pool en vez de createConnection para mejor manejo de conexiones
const db = mysql.createPool({
    host:     process.env.DB_HOST     || "localhost",
    user:     process.env.DB_USER     || "root",
    password: process.env.DB_PASSWORD || "Password2026!",
    database: process.env.DB_NAME     || "focuslab",
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0
});

// Test de conexión al iniciar
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Error al conectar con MySQL:", err.message);
    } else {
        console.log("✅ Conectado a MySQL — FocusLab");
        connection.release();
    }
});

module.exports = db;
