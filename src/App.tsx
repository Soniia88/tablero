
import Board from "./components/board";
import Header from "./components/header";
import TaskForm from "./components/taskForm";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { Task } from "./models/task";

function App() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", []);

  return (
    <div className="app">
      <Header />
      <TaskForm setTasks={setTasks} />
      <Board tasks={tasks} setTasks={setTasks} />
    </div>
  );
}

export default App;
