import { useEffect, useState } from "react";
import type { Task, TaskStatus } from "../models/task";
import { createTask, deleteTask, getTasks, updateTask, checkBackend } from "../api/tasksApi";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Carga inicial desde API (primero comprobamos el backend para detectar CORS/errores tempranos)
  useEffect(() => {
    setLoading(true);

    checkBackend()
      .then(() => getTasks())
      .then((data) => {
        setTasks(data);
        setError(null);
      })
      .catch((err: any) => setError(err?.message || "Error conectando al backend"))
      .finally(() => setLoading(false));
  }, []);

  // 🔹 Crear tarea
  const addTask = async (title: string) => {
    try {
      const newTask = await createTask({
        title,
        status: "TODO",
        color: getRandomColor(),
      });
      setTasks((prev) => [...prev, newTask]);
    } catch (err: any) {
      setError(err?.message || "Error creando tarea");
    }
  };

  // 🔹 Editar tarea
  const editTask = async (id: string, title: string) => {
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title } : t))
    );

    try {
      const updatedTask = await updateTask(id, { title });
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? updatedTask : t))
      );
    } catch (err: any) {
      setTasks(previousTasks); // rollback
      setError(err?.message || "Error editando tarea");
    }
  };

  // 🔹 Eliminar tarea
  const removeTask = async (id: string) => {
    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await deleteTask(id);
    } catch (err: any) {
      setTasks(previousTasks); // rollback
      setError(err?.message || "Error eliminando tarea");
    }
  };

  // 🔹 Mover tarea (Drag & Drop)
  const moveTask = async (id: string, newStatus: TaskStatus) => {
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTask(id, { status: newStatus });
    } catch (err: any) {
      setTasks(previousTasks); // rollback
      setError(err?.message || "Error moviendo tarea");
    }
  };

  return { tasks, loading, error, addTask, editTask, removeTask, moveTask };
}

// 🎨 Estilos por tarea
function getRandomColor(): string {
  const colors = ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa"];
  return colors[Math.floor(Math.random() * colors.length)];
}
