
import express from "express";
import pkg from "pg";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;
const app = express();


const corsOptions = {
  origin: ["http://localhost:3000", "https://donezo-vert.vercel.app"],
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());


const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: parseInt(process.env.PG_PORT),
  ssl: { rejectUnauthorized: false },
});


(async () => {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS todos (
      id BIGINT PRIMARY KEY,
      task TEXT NOT NULL,
      category TEXT NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `;
  await pool.query(createTableSql);
  console.log("Todos table ready");
})().catch(err => {
  console.error("Error creating todos table:", err);
});


app.get("/api/todos", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM todos ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/api/todos", async (req, res) => {
  const { task, category } = req.body;
  const id = Date.now();
  try {
    await pool.query(
      "INSERT INTO todos (id, task, category) VALUES ($1, $2, $3)",
      [id, task, category]
    );
    res.json({ id, task, category, completed: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.put("/api/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { task, category, completed } = req.body;
  try {
    const updateSql = `
      UPDATE todos
      SET task = $1,
          category = $2,
          completed = $3,
          updated_at = now()
      WHERE id = $4
      RETURNING *;
    `;
    const { rows } = await pool.query(updateSql, [
      task,
      category,
      completed,
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.delete("/api/todos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM todos WHERE id = $1", [id]);
    res.json({ message: "Todo deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PG_PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
