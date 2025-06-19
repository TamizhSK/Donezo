import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const app = express();

const corsOptions = {
  origin: ["http://localhost:3000", "https://donezo-vert.vercel.app"],
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}


testConnection();

// GET all todos
app.get("/api/todos", async (req, res) => {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    

    const todosWithStringId = todos.map(todo => ({
      ...todo,
      id: todo.id.toString()
    }));
    
    res.json(todosWithStringId);
  } catch (err) {
    console.error("Error fetching todos:", err);
    res.status(500).json({ error: err.message });
  }
});


app.post("/api/todos", async (req, res) => {
  const { task, category } = req.body;
  
  if (!task || !category) {
    return res.status(400).json({ error: "Task and category are required" });
  }
  
  try {
    const newTodo = await prisma.todo.create({
      data: {
        task,
        category,
        completed: false
      }
    });

    const todoWithStringId = {
      ...newTodo,
      id: newTodo.id.toString()
    };
    
    res.status(201).json(todoWithStringId);
  } catch (err) {
    console.error("Error creating todo:", err);
    res.status(500).json({ error: err.message });
  }
});


app.put("/api/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { task, category, completed } = req.body;
  
  try {
 
    const todoId = BigInt(id);
    
    const updatedTodo = await prisma.todo.update({
      where: { id: todoId },
      data: {
        task,
        category,
        completed,
        updatedAt: new Date()
      }
    });
    

    const todoWithStringId = {
      ...updatedTodo,
      id: updatedTodo.id.toString()
    };
    
    res.json(todoWithStringId);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Todo not found" });
    }
    console.error("Error updating todo:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE todo
app.delete("/api/todos/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    // Convert string id to BigInt
    const todoId = BigInt(id);
    
    await prisma.todo.delete({
      where: { id: todoId }
    });
    
    res.json({ message: "Todo deleted successfully" });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Todo not found" });
    }
    console.error("Error deleting todo:", err);
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});