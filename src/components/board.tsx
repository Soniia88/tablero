import type { Task, TaskStatus } from "../models/task";
import Column from "./column";


interface Props {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const Board = ({ tasks, setTasks }: Props) => {
  const statuses: TaskStatus[] = ["TODO", "DOING", "DONE"];

  return (
    <div className="board">
      {statuses.map(status => (
        <Column
          key={status}
          status={status}
          tasks={tasks.filter(task => task.status === status)}
          setTasks={setTasks}
        />
      ))}
    </div>
  );
};

export default Board;
