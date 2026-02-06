import type { Task } from "../models/task";

const RAW_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
const BASE_URL = RAW_BASE.replace(/\/$/, ""); // remove trailing slash if any

// Parsea respuesta y produce mensajes de error útiles cuando viene HTML/404/500
async function parseResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!res.ok) {
    // Incluimos el body (normalmente HTML de error) para depuración
    throw new Error(`HTTP ${res.status}: ${res.statusText} — ${text}`);
  }

  // Respuesta vacía (DELETE puede devolver 204 No Content)
  if (!text) return undefined as unknown as T;

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text) as T;
    } catch (e) {
      throw new Error(`Respuesta JSON inválida: ${e}`);
    }
  }

  // Si no es JSON lanzamos error con el body (por ejemplo un HTML de Vite)
  throw new Error(`Se esperaba JSON pero se recibió ${contentType}: ${text}`);
}




// Verifica que el backend esté accesible y devuelva JSON (útil para detectar CORS o caídas)
export async function checkBackend(timeoutMs = 3000): Promise<void> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    // Usamos GET para comprobar status y content-type; no parseamos el body aquí
    const res = await fetch(`${BASE_URL}/tasks`, { method: "GET", signal: controller.signal });
    clearTimeout(id);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${res.statusText} — ${text}`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      throw new Error(`La respuesta del backend no es JSON (content-type: ${contentType}) — ${text}`);
    }
  } catch (err: any) {
    if (err.name === "AbortError") throw new Error("Tiempo de espera agotado contactando el backend");
    const message = err.message || String(err);
    // Los navegadores lanzan TypeError / Failed to fetch cuando CORS o network fallan
    if (message.includes("Failed to fetch") || message.includes("NetworkError") || message.includes("TypeError")) {
      throw new Error("No se pudo conectar al backend. ¿Está arrancado y permite CORS desde este origen? (" + message + ")");
    }
    throw err;
  }
}

// Obtener todas las tareas
export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${BASE_URL}/tasks`);
  return parseResponse<Task[]>(res);
}

// Crear una nueva tarea
export async function createTask(task: Task): Promise<Task> {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return parseResponse<Task>(res);
}

// Actualizar tarea (parcial)
export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return parseResponse<Task>(res);
}

// Eliminar tarea
export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${res.statusText} — ${text}`);
  }
}
