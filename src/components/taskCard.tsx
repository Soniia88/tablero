import type { Task } from "../models/task";

interface Props {
  task: Task;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskCard = ({ task, setTasks }: Props) => {
  //Inicia el arrastre
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("taskId", task.id);
  };

  const deleteTask = () => {
    setTasks(prev => prev.filter(t => t.id !== task.id));
  };

  const editTask = () => {
    const newTitle = prompt("Nuevo título", task.title);
    if (!newTitle?.trim()) return;

    setTasks(prev =>
      prev.map(t =>
        t.id === task.id ? { ...t, title: newTitle } : t
      )
    );
  };

  return (
    <div
      className="task"
      style={{ backgroundColor: task.color }}
      draggable
      onDragStart={handleDragStart}
    >
      <p>{task.title}</p>
        <button onClick={editTask}>Editar</button>
        <button onClick={deleteTask}>Eliminar</button>
    </div>
  );
};

export default TaskCard;
