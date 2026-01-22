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

    const newTask: Task = {
  id: crypto.randomUUID(),
  title,
  status: "TODO",
  selected: false,
};


    setTasks(prev => [...prev, newTask]);
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit}>
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
