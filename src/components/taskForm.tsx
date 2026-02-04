import { useState, type FormEvent } from "react";

interface Props {
  addTask: (title: string) => Promise<void>; // ahora llama al hook que hace POST a la API
}

const TaskForm = ({ addTask }: Props) => {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Llamamos a la función del hook que hace POST a la API
      await addTask(title);
      setTitle(""); // limpiar input
    } catch (err: any) {
      setError(err?.message || "Error creando tarea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      style={{ padding: "0px 0px 20px 0px" }}
      onSubmit={handleSubmit}
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nueva tarea"
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Creando..." : "Crear"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
};

export default TaskForm;

