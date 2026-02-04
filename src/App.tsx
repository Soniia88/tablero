import Board from "./components/board";
import Header from "./components/header";
import TaskForm from "./components/taskForm";
import { useTasks } from "./hooks/useTasks";

function App() {
  const {
    tasks,
    loading,
    error,
    addTask,
    editTask,
    removeTask,
    moveTask,
  } = useTasks();

  if (loading) {
    return (
      <div className="app">
        <Header />
        <p>Cargando tareas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <Header />
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />

      <TaskForm addTask={addTask} />

      <Board
        tasks={tasks}
        onEdit={editTask}
        onDelete={removeTask}
        onMove={moveTask}
      />
    </div>
  );
}

export default App;
