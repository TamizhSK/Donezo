"use client";

import { useEffect, useState } from "react";
import { Trash2, Edit, Plus, Calendar, Search, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Todo = {
  id: number;
  task: string;
  category: string;
  completed: boolean;
};

const categories = [
  { value: "work", label: "Work", color: "bg-blue-500" },
  { value: "personal", label: "Personal", color: "bg-purple-500" },
  { value: "shopping", label: "Shopping", color: "bg-green-500" },
  { value: "health", label: "Health", color: "bg-rose-500" },
];


export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [task, setTask] = useState("");
  const [category, setCategory] = useState("work");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTask, setEditTask] = useState("");
  const [editCategory, setEditCategory] = useState("work");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("all");

  useEffect(() => {
    // Fetch todos on component mount
    fetchTodos();
    
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const fetchTodos = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/todos`);
      if (!res.ok) throw new Error("Failed to fetch todos");
      
      const data = await res.json();
      if (Array.isArray(data)) {
        setTodos(data);
      } else {
        setError("Invalid data format from server.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Could not load todos.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!task.trim()) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, category }),
      });
      
      if (!res.ok) throw new Error("Failed to add todo");
      
      const newTodo = await res.json();
      setTodos([newTodo, ...todos]);
      setTask("");
    } catch (err) {
      setError("Failed to add todo. Please try again.");
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/todos/${id}`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) throw new Error("Failed to delete todo");
      
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      setError("Failed to delete todo. Please try again.");
      console.error(err);
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditTask(todo.task);
    setEditCategory(todo.category);
    setEditDialogOpen(true);
  };

  const handleUpdate = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: editTask,
          category: editCategory,
          completed: todos.find(t => t.id === id)?.completed || false,
        }),
      });
      
      if (!res.ok) throw new Error("Failed to update todo");
      
      const updated = await res.json();
      setTodos(todos.map(todo => (todo.id === id ? updated : todo)));
      setEditingId(null);
      setEditDialogOpen(false);
    } catch (err) {
      setError("Failed to update todo. Please try again.");
      console.error(err);
    }
  };

  const toggleCompleted = async (id: number) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...todo,
          completed: !todo.completed,
        }),
      });
      
      if (!res.ok) throw new Error("Failed to update todo status");
      
      const updated = await res.json();
      setTodos(todos.map(t => (t.id === id ? updated : t)));
    } catch (err) {
      setError("Failed to update todo status. Please try again.");
      console.error(err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAdd();
  };

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    if (value === "all") {
      setFilterCategory(null);
      setShowCompleted(true);
    } else if (value === "active") {
      setFilterCategory(null);
      setShowCompleted(false);
    } else {
      setFilterCategory(value);
      setShowCompleted(true);
    }
  };

  const filteredTodos = todos
    .filter(todo => showCompleted || !todo.completed)
    .filter(todo => filterCategory === null || todo.category === filterCategory)
    .filter(todo => 
      todo.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categories.find(c => c.value === todo.category)?.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getCategoryLabel = (categoryValue: string) => {
    return categories.find(c => c.value === categoryValue)?.label || categoryValue;
  };

  const getCompletedCount = () => {
    return todos.filter(todo => todo.completed).length;
  };

  const getRemainingCount = () => {
    return todos.filter(todo => !todo.completed).length;
  };

  function getCategoryBadgeVariant(category: string): "default" | "secondary" | "destructive" | "outline" {
    switch (category) {
      case "work":
        return "default";
      case "personal":
        return "secondary";
      case "shopping":
        return "outline";
      case "health":
        return "destructive";
      default:
        return "default";
    }
  }

  return (
    <div className="min-h-screen bg-background p-6 flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="w-full justify-items-center font-semibold text-2xl py-3"><p>Donezo✅</p></div>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-2xl font-bold">Todo List</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-full"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Add Task Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Add a new task"
                className="flex-1"
              />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <div className="flex items-center gap-2">
                        <div className={`${c.color} h-2 w-2 rounded-full`}></div>
                        <span>{c.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </form>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{todos.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{getCompletedCount()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{getRemainingCount()}</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tasks..."
                  className="pl-8"
                />
              </div>
              
              <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                <Switch
                  id="show-completed"
                  checked={showCompleted}
                  onCheckedChange={setShowCompleted}
                />
                <Label htmlFor="show-completed">Show completed</Label>
              </div>
            </div>

            {/* Tabs and Todo List */}
            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
              <TabsList
                className="flex gap-2 mb-4 whitespace-nowrap overflow-x-auto max-w-full px-4 scroll-pl-4 scroll-pr-4" style={{scrollPaddingInlineStart: '1rem', scrollPaddingInlineEnd: '1rem'}}>
                <TabsTrigger value="all" className="flex-shrink-0">All</TabsTrigger>
                <TabsTrigger value="active" className="flex-shrink-0">Active</TabsTrigger>
                <TabsTrigger value="work" className="flex-shrink-0">Work</TabsTrigger>
                <TabsTrigger value="personal" className="flex-shrink-0">Personal</TabsTrigger>
                <TabsTrigger value="health" className="flex-shrink-0">Health</TabsTrigger>
                <TabsTrigger value="shopping" className="flex-shrink-0">Shopping</TabsTrigger>
              </TabsList>
              {/* Todo Items */}
                <Card>
                  <CardContent className="p-0 max-h-[35vh] sm:max-h-[40vh] md:max-h-[45vh] overflow-y-auto">
                    {loading ? (
                      <div className="p-4 space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center space-x-3">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredTodos.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No tasks found</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredTodos.map((todo) => (
                          <div
                            key={todo.id}
                            className={`p-3 flex items-center gap-3 ${
                              todo.completed ? "bg-muted/30" : ""
                            }`}
                          >
                            <Checkbox
                              checked={todo.completed}
                              onCheckedChange={() => toggleCompleted(todo.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <p
                                onClick={() => toggleCompleted(todo.id)}
                                className={`font-medium cursor-pointer ${
                                  todo.completed ? "line-through text-muted-foreground" : ""
                                }`}
                              >
                                {todo.task}
                              </p>
                              <Badge
                                variant={getCategoryBadgeVariant(todo.category)}
                                className="mt-1 text-xs"
                              >
                                {getCategoryLabel(todo.category)}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(todo)}
                                className="h-8 w-8 text-blue-500"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(todo.id)}
                                className="h-8 w-8 text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
            </Tabs>
          </CardContent>
        </Card>
       <div className="fixed bottom-0 left-0 w-full flex justify-center items-center p-4 text-stone-500 text-sm shadow-sm"><p>&copy; Crafted By <span className="text-stone-50">Tamizh SK</span></p></div>
      </div>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>
                Make changes to your task. Click save when done.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="task-name" className="text-left sm:text-right">
                  Task
                </Label>
                <Input
                  id="task-name"
                  value={editTask}
                  onChange={(e) => setEditTask(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="task-category" className="text-left sm:text-right">
                  Category
                </Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger className="col-span-1 sm:col-span-3">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <div className="flex items-center gap-2">
                          <div className={`${c.color} h-2 w-2 rounded-full`}></div>
                          <span>{c.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={() => editingId !== null && handleUpdate(editingId)} className="w-full sm:w-auto">
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      
      </div>
  );
}