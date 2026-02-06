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
        // Asignar color a tareas que no lo tengan
        const tasksWithColor = data.map((task) => ({
          ...task,
          color: task.color || getRandomColor(),
        }));
        setTasks(tasksWithColor);
        setError(null);
      })
      .catch((err: any) => setError(err?.message || "Error conectando al backend"))
      .finally(() => setLoading(false));
  }, []);

  // 🔹 Crear tarea
  const addTask = async (title: string) => {
    const randomColor = getRandomColor();
    try {
      const newTask = await createTask({
        title,
        status: "TODO",
        color: randomColor,
      });
      // Asegurar que la tarea tiene color (por si el backend no lo devuelve)
      const taskWithColor = { ...newTask, color: newTask.color || randomColor };
      setTasks((prev) => [...prev, taskWithColor]);
    } catch (err: any) {
      setError(err?.message || "Error creando tarea");
    }
  };

  // 🔹 Editar tarea
  const editTask = async (id: string, title: string) => {
    const previousTasks = [...tasks];
    const taskToEdit = tasks.find((t) => t.id === id);
    
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title } : t))
    );

    try {
      const updatedTask = await updateTask(id, { title, status: taskToEdit?.status });
      // Preservar el color original
      const taskWithOriginalColor = { ...updatedTask, color: taskToEdit?.color || updatedTask.color };
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? taskWithOriginalColor : t))
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
    const taskToMove = tasks.find((t) => String(t.id) === String(id));
    
    if (!taskToMove) {
      setError(`Tarea no encontrada (ID: ${id})`);
      return;
    }
    
    const previousTasks = [...tasks];
    
    setTasks((prev) =>
      prev.map((t) => (t.id === id || String(t.id) === String(id) ? { ...t, status: newStatus } : t))
    );

    try {
      const updatedTask = await updateTask(id, { title: taskToMove.title, status: newStatus });
      // Preservar el color original
      const taskWithOriginalColor = { ...updatedTask, color: taskToMove.color || updatedTask.color };
      setTasks((prev) =>
        prev.map((t) => (String(t.id) === String(id) ? taskWithOriginalColor : t))
      );
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
