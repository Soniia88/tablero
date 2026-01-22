import type { Task } from "../models/task";

interface Props {
  task: Task;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskCard = ({ task, setTasks }: Props) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("taskId", task.id);
  };

  const selectTask = () => {
    setTasks(prev =>
      prev.map(t =>
        t.id === task.id
          ? { ...t, selected: true }
          : { ...t, selected: false }
      )
    );
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
      className={`task ${task.selected ? "selected" : ""}`}
      draggable
      onDragStart={handleDragStart}
      onClick={selectTask}
    >
      <p>{task.title}</p>
      <div className="task-actions">
        <button onClick={editTask}>Editar</button>
        <button onClick={deleteTask}>Eliminar</button>
      </div>
    </div>
  );
};

export default TaskCard;
