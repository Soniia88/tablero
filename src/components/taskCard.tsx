import type { Task } from "../models/task";

interface Props {
  task: Task;
  onEdit: (taskId: string, title: string) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard = ({ task, onEdit, onDelete }: Props) => {
  // Inicia el arrastre
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("taskId", task.id.toString());
  };

  const handleDelete = () => {
    onDelete(task.id);
  };

  const handleEdit = () => {
    const newTitle = prompt("Nuevo título", task.title);
    if (!newTitle?.trim()) return;

    onEdit(task.id, newTitle);
  };

  return (
    <div
      className="task"
      style={{ backgroundColor: task.color }}
      draggable
      onDragStart={handleDragStart}
    >
      <p>{task.title}</p>

      <div className="task-actions">
        <button onClick={handleEdit}>Editar</button>
        <button onClick={handleDelete}>Eliminar</button>
      </div>
    </div>
  );
};

export default TaskCard;
