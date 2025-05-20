const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: "https://donezo-vert.vercel.app/",
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT,
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err);
    return;
  }
  console.log("Connected to MySQL");

  const tableSql = `
    CREATE TABLE IF NOT EXISTS todos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      task VARCHAR(255) NOT NULL,
      category VARCHAR(50) NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(tableSql, (err) => {
    if (err) throw err;
    console.log("Todos table ready");
  });
});

// Get all todos
app.get("/api/todos", (req, res) => {
  db.query("SELECT * FROM todos ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add a new todo
app.post("/api/todos", (req, res) => {
  const { task, category } = req.body;
  const query = "INSERT INTO todos (task, category) VALUES (?, ?)";
  db.query(query, [task, category], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      id: result.insertId,
      task,
      category,
      completed: false,
    });
  });
});

// Update a todo
app.put("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  const { task, category, completed } = req.body;
  const query =
    "UPDATE todos SET task = ?, category = ?, completed = ? WHERE id = ?";
  db.query(query, [task, category, completed, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, task, category, completed });
  });
});

// Delete a todo
app.delete("/api/todos/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM todos WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Todo deleted" });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
