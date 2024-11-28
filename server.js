const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Configura��es do servidor
app.use(cors());
app.use(bodyParser.json());

// Conex�o com o banco de dados SQLite
const db = new sqlite3.Database("scores.db");

// Cria a tabela de pontua��o se n�o existir
db.run(
  "CREATE TABLE IF NOT EXISTS scores (id INTEGER PRIMARY KEY, name TEXT, score INTEGER)"
);

// Rota para obter o Top 10 pontua��es
app.get("/scores", (req, res) => {
  db.all("SELECT name, score FROM scores ORDER BY score DESC LIMIT 10", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Rota para inserir a pontua��o
app.post("/scores", (req, res) => {
  const { name, score } = req.body;

  if (!name || score == null) {
    return res.status(400).json({ error: "Nome e pontua��o s�o obrigat�rios!" });
  }

  db.run("INSERT INTO scores (name, score) VALUES (?, ?)", [name, score], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://10.180.0.219:${PORT}`);
});
