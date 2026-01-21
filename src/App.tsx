import Tabla from './components/tabla';

function App() {
  const tareasTodo = [
    { id: 1, texto: 'tarea 1' }
  ];

  const tareasDoing = [
    { id: 3, texto: 'tarea 2' }
  ];

  const tareasDone = [
    { id: 4, texto: 'tarea 3' }
  ];

  return (
    <div>
      <h1>Tablero Kanban de Tareas</h1>
      <Tabla todo={tareasTodo} doing={tareasDoing} done={tareasDone} />
    </div>
  );
}

export default App;
