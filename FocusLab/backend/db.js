const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "focuslab"
});

db.connect((err) => {
    if (err) {
        console.log("Error conexión BD:", err);
    } else {
        console.log("Conectado a MySQL FocusLab");
    }
});

module.exports = db;