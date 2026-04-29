const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// DB
const db = require("./db");

// TEST
app.get("/", (req, res) => {
    res.send("FocusLab backend funcionando 🚀");
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log("Servidor corriendo en http://localhost:" + PORT);
});