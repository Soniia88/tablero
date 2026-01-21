import React from 'react';

interface Tarea {
  id: number;
  texto: string;
}

interface TablaProps {
  todo: Tarea[];
  doing: Tarea[];
  done: Tarea[];
}

const Tabla: React.FC<TablaProps> = ({ todo, doing, done }) => {
  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', border: '2px solid' }}>
      <div>
        <h2>TODO</h2>
        <ul>
          {todo.map(t => <li key={t.id}>{t.texto}</li>)}
        </ul>
      </div>
      <div>
        <h2>DOING</h2>
        <ul>
          {doing.map(t => <li key={t.id}>{t.texto}</li>)}
        </ul>
      </div>
      <div>
        <h2>DONE</h2>
        <ul>
          {done.map(t => <li key={t.id}>{t.texto}</li>)}
        </ul>
      </div>
    </div>
  );
}

export default Tabla;
