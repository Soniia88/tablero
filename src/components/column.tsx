import { useState } from "react";
import type { TaskStatus, Task } from "../models/task";
import TaskCard from "./taskCard";


interface Props {
  status: TaskStatus;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const Column = ({ status, tasks, setTasks }: Props) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const taskId = e.dataTransfer.getData("taskId");

    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, status } : task
      )
    );

    setIsOver(false);
  };

  return (
    <section
      className={`column ${isOver ? "over" : ""}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnter={() => setIsOver(true)}
      onDragLeave={() => setIsOver(false)}
    >
      <h2>{status}</h2>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} setTasks={setTasks} />
      ))}
    </section>
  );
};

export default Column;
