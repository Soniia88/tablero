import type { Task, TaskStatus } from "../models/task";
import Column from "./column";

interface Props {
  tasks: Task[];
  onMove: (taskId: string, newStatus: TaskStatus) => void;
  onEdit: (taskId: string, title: string) => void;
  onDelete: (taskId: string) => void;
}

const Board = ({ tasks, onMove, onEdit, onDelete }: Props) => {
  const statuses: TaskStatus[] = ["TODO", "DOING", "DONE"];

  return (
    <div className="board">
      {statuses.map((status) => (
        <Column
          key={status}
          status={status}
          tasks={tasks.filter((task) => task.status === status)}
          onMove={onMove}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default Board;

