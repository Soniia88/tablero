import { useState } from "react";
import type { TaskStatus, Task } from "../models/task";
import TaskCard from "./taskCard";

interface Props {
  status: TaskStatus;
  tasks: Task[];
  onMove: (taskId: string, newStatus: TaskStatus) => void;
  onEdit: (taskId: string, title: string) => void;
  onDelete: (taskId: string) => void;
}

const Column = ({ status, tasks, onMove, onEdit, onDelete }: Props) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const taskId = e.dataTransfer.getData("taskId");
    onMove(taskId, status);
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

      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
};

export default Column;
