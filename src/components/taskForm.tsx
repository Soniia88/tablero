import { useState, type FormEvent } from "react";
import type { Task } from "../models/task";

interface Props {
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskForm = ({ setTasks }: Props) => {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    // Creación de una tarea nueva
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      status: "TODO",
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    };

    // Añade la tarea al estado global
    setTasks(prev => [...prev, newTask]);
    setTitle("");
  };

  return (
    <form style={{ padding: ' 0px 0px 20px 0px'}} onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Nueva tarea"
      />
      <button>Crear</button>
    </form>
  );
};

export default TaskForm;
