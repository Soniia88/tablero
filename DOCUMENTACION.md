# 📋 Explicación Completa del Código del Proyecto Tablero Kanban

Este documento explica en detalle cómo funciona toda la arquitectura del proyecto, componentes, flujos de datos y patrones utilizados.

---

# 🏗️ Arquitectura General

La aplicación es un **Tablero Kanban** que permite crear, editar, mover y eliminar tareas. Los datos se almacenan en un **backend** (API REST) y no se usa localStorage.

## Flujo de Datos

```
Backend API
    ↓
tasksApi.ts (llamadas HTTP)
    ↓
useTasks.ts (lógica y estado)
    ↓
App.tsx (componente raíz)
    ↓
Board.tsx → Column.tsx → TaskCard.tsx
Header.tsx, TaskForm.tsx
```

---

# 📦 Modelos de Datos

## task.ts

Define la estructura de una tarea:

```typescript
export type TaskStatus = "TODO" | "DOING" | "DONE";

export interface Task {
  id?: string;
  title: string;
  status: TaskStatus;  // En qué columna está
  color: string;       // Color de fondo (generado aleatoriamente)
}
```

- **`id`**: Identificador único (creado por el backend)
- **`title`**: Texto de la tarea
- **`status`**: En cuál de las 3 columnas está
- **`color`**: Color de fondo (se asigna al crear)

---

# 🔌 Capa de API (tasksApi.ts)

Gestiona toda la comunicación con el backend mediante **fetch**.

## Configuración Base

```typescript
const RAW_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
const BASE_URL = RAW_BASE.replace(/\/$/, "");
```

Lee la URL del backend desde variables de entorno (`.env`). Por ejemplo: `http://localhost:3000`

## Función auxiliar: `parseResponse`

```typescript
async function parseResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText} — ${text}`);
  }

  if (!text) return undefined as unknown as T;  // Para DELETE (204 No Content)

  if (contentType.includes("application/json")) {
    return JSON.parse(text) as T;
  }

  throw new Error(`Se esperaba JSON pero se recibió ${contentType}: ${text}`);
}
```

**¿Por qué existe?**
- Maneja respuestas vacías (DELETE devuelve 204 sin body)
- Detecta si el backend devuelve HTML en lugar de JSON (error común)
- Proporciona mensajes de error detallados

## checkBackend()

```typescript
export async function checkBackend(timeoutMs = 3000): Promise<void>
```

**¿Qué hace?** Se ejecuta al iniciar la app para comprobar:
- ✅ El backend está accesible
- ✅ Devuelve JSON (no HTML de error)
- ✅ CORS está configurado correctamente
- ✅ No hay problemas de conexión

Si falla, muestra un error claro: `"No se pudo conectar al backend. ¿Está arrancado...?"`

## CRUD Operations

### getTasks()
```typescript
export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${BASE_URL}/tasks`);
  return parseResponse<Task[]>(res);
}
```
- **Método**: GET
- **Endpoint**: `/tasks`
- **Respuesta**: Array de tareas

### createTask()
```typescript
export async function createTask(task: Task): Promise<Task> {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return parseResponse<Task>(res);
}
```
- **Método**: POST
- **Endpoint**: `/tasks`
- **Body**: Objeto tarea (sin `id`, lo genera el backend)
- **Respuesta**: La tarea creada con `id` asignado

### updateTask()
```typescript
export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return parseResponse<Task>(res);
}
```
- **Método**: PUT (actualización completa con validación)
- **Endpoint**: `/tasks/:id`
- **Body**: Objeto con los campos a actualizar (debe incluir `title` y `status`)
- **Respuesta**: La tarea actualizada completa

### deleteTask()
```typescript
export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(...);
}
```
- **Método**: DELETE
- **Endpoint**: `/tasks/:id`
- **Respuesta**: Ninguna (204 No Content)

---

# 🎣 Hook Personalizado (useTasks.ts)

Centraliza toda la lógica de estado y operaciones sobre tareas.

## Estado

```typescript
const [tasks, setTasks] = useState<Task[]>([]);        // Array de todas las tareas
const [loading, setLoading] = useState<boolean>(true);  // Cargando inicial
const [error, setError] = useState<string | null>(null); // Mensajes de error
```

## Carga Inicial (useEffect)

```typescript
useEffect(() => {
  setLoading(true);

  checkBackend()
    .then(() => getTasks())
    .then((data) => {
      setTasks(data);
      setError(null);
    })
    .catch((err: any) => setError(err?.message || "Error conectando al backend"))
    .finally(() => setLoading(false));
}, []);
```

**Flujo:**
1. Se ejecuta una vez cuando monta el componente (`[]` = sin dependencias)
2. Comprueba que el backend está ok
3. Si está ok, obtiene todas las tareas
4. Las almacena en el estado
5. Si hay error en cualquier paso, lo guarda

## addTask()

```typescript
const addTask = async (title: string) => {
  const randomColor = getRandomColor();
  try {
    const newTask = await createTask({
      title,
      status: "TODO",
      color: randomColor,
    });
    // Asegurar que la tarea tiene color (por si el backend no lo devuelve)
    const taskWithColor = { ...newTask, color: newTask.color || randomColor };
    setTasks((prev) => [...prev, taskWithColor]);
  } catch (err: any) {
    setError(err?.message || "Error creando tarea");
  }
};
```

**Pasos:**
1. Genera un color aleatorio antes de enviar
2. Envía POST al backend con título, status y color
3. Backend devuelve la tarea con `id` asignado
4. Si el backend no devuelve color, usa el generado localmente
5. Agrega la tarea al estado local
6. Si falla, guarda el error

**Color:**
- Cada tarea nueva recibe un color aleatorio
- El color se preserva aunque edites la tarea después

## editTask()

```typescript
const editTask = async (id: string, title: string) => {
  const previousTasks = [...tasks];
  const taskToEdit = tasks.find((t) => t.id === id);
  
  setTasks((prev) =>
    prev.map((t) => (t.id === id ? { ...t, title } : t))
  );

  try {
    const updatedTask = await updateTask(id, { title, status: taskToEdit?.status });
    // Preservar el color original
    const taskWithOriginalColor = { ...updatedTask, color: taskToEdit?.color || updatedTask.color };
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? taskWithOriginalColor : t))
    );
  } catch (err: any) {
    setTasks(previousTasks); // rollback
    setError(err?.message || "Error editando tarea");
  }
};
```

**Patrón: Optimistic Update (Actualización Optimista)**
1. Guarda el estado previo por si falla
2. Guarda tarea actual para acceder a `status` y `color`
3. Actualiza UI **inmediatamente** (sin esperar al servidor)
4. Envía cambio al backend (con `title` y `status`)
5. Si respuesta es OK, confirma pero **preserva el color original**
6. Si falla, revierte a estado anterior

**Ventaja**: La UI responde al instante, aunque luego espere confirmación. El color nunca cambia en ediciones.

## removeTask()

```typescript
const removeTask = async (id: string) => {
  const previousTasks = [...tasks];  // Guardar estado
  setTasks((prev) => prev.filter((t) => t.id !== id));  // Eliminar optimista

  try {
    await deleteTask(id);  // Confirmar en backend
  } catch (err: any) {
    setTasks(previousTasks);  // Si falla, restaurar
    setError(err?.message || "Error eliminando tarea");
  }
};
```

Similar a `editTask()`: actualización optimista con rollback si falla.
taskToMove = tasks.find((t) => String(t.id) === String(id));
  
  if (!taskToMove) {
    setError(`Tarea no encontrada (ID: ${id})`);
    return;
  }
  
  const previousTasks = [...tasks];
  
  setTasks((prev) =>
    prev.map((t) => (t.id === id || String(t.id) === String(id) ? { ...t, status: newStatus } : t))
  );

  try {
    const updatedTask = await updateTask(id, { title: taskToMove.title, status: newStatus });
    // Preservar el color original
    const taskWithOriginalColor = { ...updatedTask, color: taskToMove.color || updatedTask.color };
    setTasks((prev) =>
      prev.map((t) => (String(t.id) === String(id) ? taskWithOriginalColor : t))
    );
  } catch (err: any) {
    setTasks(previousTasks); // rollback
    setError(err?.message || "Error moviendo tarea");
  }
};
```

Se ejecuta cuando arrastras una tarea entre columnas:
1. Busca la tarea guardando su `title` y `color`
2. Actualización optimista: cambia status en UI al instante
3. Envía al backend con `title` (requerido) y `status`
4. Si OK, confirma pero **preserva el color original**
5. Si falla, revierte cambios
6. Compara IDs como strings por compatibilidad tipo (número vs string)
  }
};
```

Se ejecuta cuando arrastras una tarea entre columnas. Misma lógica: optimista + confirmación.

## getRandomColor()

```typescript
function getRandomColor(): string {
  const colors = ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa"];
  return colors[Math.floor(Math.random() * colors.length)];
}
```

Elige un color aleatorio de 5 opciones predefinidas.

---

# ⚛️ Componentes React

## App.tsx (Raíz)

```typescript
function App() {
  const { tasks, loading, error, addTask, editTask, removeTask, moveTask } = useTasks();

  if (loading) return <div>Cargando tareas...</div>;
  if (error) return <div><p className="error">{error}</p></div>;

  return (
    <div className="app">
      <Header />
      <TaskForm addTask={addTask} />
      <Board tasks={tasks} onEdit={editTask} onDelete={removeTask} onMove={moveTask} />
    </div>
  );
}
```

**¿Qué hace?**
1. Obtiene todo del hook `useTasks`
2. Si está cargando, muestra "Cargando..."
3. Si hay error, lo muestra
4. Si está ok, renderiza 3 secciones:
   - **Header**: Título
   - **TaskForm**: Formulario para crear tarea
   - **Board**: El tablero con 3 columnas

---

## Header.tsx

```typescript
const Header = () => {
  return (
    <header className="header">
      <h1>Tablero Kanban</h1>
    </header>
  );
};
```

Solo muestra el título. Componente simple sin lógica.

---

## TaskForm.tsx

Formulario para crear nuevas tareas.

```typescript
const TaskForm = ({ addTask }: Props) => {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;  // No permitir títulos vacíos

    setLoading(true);
    setError(null);

    try {
      await addTask(title);  // Llamar función del hook
      setTitle("");  // Limpiar input
    } catch (err: any) {
      setError(err?.message || "Error creando tarea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nueva tarea"
        disabled={loading}  // Desactiva mientras se envía
      />
      <button type="submit" disabled={loading}>
        {loading ? "Creando..." : "Crear"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
};
```

**Flujo:**
1. Usuario escribe título en input
2. Presiona "Crear" o Enter
3. Se envía al hook `addTask()`
4. Mientras se envía: botón desactivo y muestra "Creando..."
5. Si falla: muestra error

---

## Board.tsx

Contenedor que renderiza las 3 columnas.

```typescript
const Board = ({ tasks, onMove, onEdit, onDelete }: Props) => {
  const statuses: TaskStatus[] = ["TODO", "DOING", "DONE"];

  return (
    <div className="board">
      {statuses.map((status) => (
        <Column
          key={status}
          status={status}
          tasks={tasks.filter((task) => task.status === status)}  // Solo tareas de esta columna
          onMove={onMove}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
```

**¿Qué hace?**
1. Define las 3 columnas: "TODO", "DOING", "DONE"
2. Para cada una, crea un `<Column>`
3. Filtra tareas por su status y las pasa a cada columna
4. Propaga callbacks de mover, editar, eliminar

---

## Column.tsx

Una columna del tablero con soporte para Drag & Drop.

```typescript
const Column = ({ status, tasks, onMove, onEdit, onDelete }: Props) => {
  const [isOver, setIsOver] = useState(false);  // Mientras arrastra sobre la columna

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();  // Permite soltar
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const taskId = e.dataTransfer.getData("taskId");  // Obtener ID de la tarea arrastrada
    onMove(taskId, status);  // Llamar función para mover
    setIsOver(false);
  };

  return (
    <section
      className={`column ${isOver ? "over" : ""}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnter={() => setIsOver(true)}
      onDragLeave={() => setIsOver(false)}
    >
      <h2>{status}</h2>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
};
```

**Drag & Drop:**
- **`onDragOver`**: Se ejecuta mientras arrastras una tarea sobre la columna
  - `e.preventDefault()` indica que esta zona **acepta drops**
- **`onDragEnter`**: Cuando entras con una tarea → marca columna como "over" (highlight CSS)
- **`onDragLeave`**: Cuando sales con una tarea → quita highlight
- **`onDrop`**: Al soltar
  - Lee el `taskId` del objeto arrastrado
  - Llama `onMove(taskId, status)` para actualizar

---

## TaskCard.tsx

Una tarjeta individual de tarea.

```typescript
const TaskCard = ({ task, onEdit, onDelete }: Props) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("taskId", task.id.toString());  // Guardar ID al arrastrar
  };

  const handleDelete = () => {
    onDelete(task.id);  // Llamar función para eliminar
  };

  const handleEdit = () => {
    const newTitle = prompt("Nuevo título", task.title);  // Pedir nuevo título
    if (!newTitle?.trim()) return;  // Si cancela o está vacío, no hacer nada

    onEdit(task.id, newTitle);  // Enviar cambio
  };

  return (
    <div
      className="task"
      style={{ backgroundColor: task.color }}  // Color único de la tarea
      draggable
      onDragStart={handleDragStart}
    >
      <p>{task.title}</p>

      <div className="task-actions">
        <button onClick={handleEdit}>Editar</button>
        <button onClick={handleDelete}>Eliminar</button>
      </div>
    </div>
  );
};
```

**Funcionalidades:**
1. **Arrastrables** (`draggable`, `onDragStart`)
   - Al empezar a arrastrar, guarda su ID
   - Puede soltarse en cualquier columna
2. **Editar** (botón)
   - Abre prompt pidiendo nuevo título
   - Envía cambio al hook
3. **Eliminar** (botón)
   - Llama función de eliminación
   - Con rollback si falla

---

# 🔄 Flujo Completo: Crear una Tarea

```
Usuario escribe "Hacer la compra" y presiona Crear
              ↓
TaskForm.handleSubmit() se ejecuta
              ↓
Llama addTask("Hacer la compra") del hook
              ↓
Hook: POST a /tasks con { title, status: "TODO", color }
              ↓
Backend crea tarea y devuelve { id: "123", title, status, color }
              ↓
Hook: setTasks([...tasks, newTask])
              ↓
App.tsx se re-renderiza (props cambian)
              ↓
Board.tsx recibe nuevas tareas
              ↓
Column.tsx "TODO" filtra y recibe la tarea
              ↓
TaskCard.tsx renderiza "Hacer la compra" con botones
              ↓
Usuario ve la tarea en pantalla
```

---

# 🔄 Flujo Completo: Mover una Tarea (Drag & Drop)

```
Usuario arrastra tarea "Hacer la compra" de TODO a DOING
              ↓
TaskCard.onDragStart() guarda ID en dataTransfer
              ↓
Usuario la suelta en columna DOING
              ↓
Column.onDrop() en DOING se ejecuta
              ↓
Lee taskId del dataTransfer
              ↓
Llama onMove("123", "DOING")
              ↓
Hook: PATCH a /tasks/123 con { status: "DOING" }
              ↓
Backend actualiza tarea
              ↓
Hook: setTasks actualiza status
              ↓
Board re-filtra tareas por status
              ↓
Tarea se mueve visualmente de columna
```

---

# 🔄 Flujo Completo: Editar una Tarea

```
Usuario hace click en "Editar" en una tarjeta
              ↓
TaskCard.handleEdit() se ejecuta
              ↓
Abre prompt("Nuevo título", "Título actual")
              ↓
Usuario escribe "Hacer la compra hoy" y OK
              ↓
Llama onEdit(taskId, "Hacer la compra hoy")
              ↓
Hook: Actualización OPTIMISTA
  setTasks() actualiza título inmediatamente
  UI muestra "Hacer la compra hoy" al instante
              ↓
Hook: PATCH a /tasks/id con { title: "Hacer la compra hoy" }
              ↓
Backend actualiza y devuelve tarea completa
              ↓
Hook: setTasks() confirma con datos del backend
              ↓
Si todo OK: usuario ni se percata del delay
Si falla: se revierte al título anterior
```

---

# 🔄 Flujo Completo: Eliminar una Tarea

```
Usuario hace click en "Eliminar"
              ↓
TaskCard.handleDelete() se ejecuta
              ↓
Llama onDelete(taskId)
              ↓
Hook: Actualización OPTIMISTA
  setTasks() filtra la tarea inmediatamente
  La tarea desaparece de pantalla
              ↓
Hook: DELETE a /tasks/id
              ↓
Backend elimina tarea
              ↓
Si OK: ya estaba eliminada de UI
Si falla: setTasks(previousTasks) la restaura
```

---

# ✅ Patrones y Mejores Prácticas Utilizadas

## 1. **Separación de Responsabilidades**
- **tasksApi.ts**: Solo comunicación con backend
- **useTasks.ts**: Lógica de estado y operaciones
- **Componentes**: Renderizado y eventos UI

## 2. **Actualización Optimista**
- Cambios se reflejan en UI inmediatamente
- Backend confirma después
- Si falla, se revierte automáticamente

## 3. **Manejo de Estados**
- `loading`: Indicar que está esperando
- `error`: Mostrar errores al usuario
- `tasks`: El estado actual de datos

## 4. **Validación y Errores**
- No permite títulos vacíos
- Mensajes de error detallados
- Detecta problemas CORS y conexión

## 5. **Drag & Drop Nativo**
- Usa Drag & Drop API del navegador
- Sin librerías externas
- Funciona en todos los navegadores modernos

## 6. **Rollback en Operaciones**
- Se guarda el estado anterior antes de cambiar
- Si operación falla, se restaura automáticamente
- Usuario nunca ve datos inconsistentes

---

# 🌐 Endpoints Esperados en el Backend

```
GET    /tasks              → Obtiene todas las tareas
POST   /tasks              → Crea nueva tarea
PUT    /tasks/:id          → Actualiza tarea (requiere title y status)
DELETE /tasks/:id          → Elimina tarea
```

**Respuesta esperada de GET /tasks:**
```json
[
  { "id": "1", "title": "Hacer la compra", "status": "TODO", "color": "#f87171" },
  { "id": "2", "title": "Escribir reporte", "status": "DOING", "color": "#60a5fa" }
]
```

**Formato esperado en PUT /tasks/:id:**
```json
{
  "title": "Nuevo título",
  "status": "DONE"
}
```

**Importante:** 
- El endpoint PUT debe aceptar tanto `title` como `status` (ambos son obligatorios)
- El `color` se asigna localmente y no se envía en actualizaciones
- El `id` es generado por el backend al crear (en POST)

---

# � Configuración CORS en el Backend

La app React corre en `http://localhost:5173` y el backend en `http://localhost:8080`. Sin configuración CORS, el navegador **bloquea** las solicitudes entre orígenes distintos.

## Solución: CorsConfig en Spring Boot

Crea un archivo `CorsConfig.java` en tu proyecto backend:

```java
package com.ejemplo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:5173")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

**Qué hace:**
- `addMapping("/**")` - Aplica a todos los endpoints
- `allowedOrigins("http://localhost:5173")` - Permite solicitudes desde React
- `allowedMethods(...)` - Métodos HTTP permitidos
- `maxAge(3600)` - Cachea la config por 1 hora

Después de agregar esto, **reinicia tu backend** para que los cambios tomen efecto.

---

Este proyecto es un ejemplo completo de:
- ✅ Aplicación React modular y bien estructurada
- ✅ Comunicación con backend vía API REST
- ✅ Gestión de estado centralizado en hooks
- ✅ UX mejorada con actualización optimista
- ✅ Drag & Drop nativo del navegador
- ✅ Manejo robusto de errores y edge cases
- ✅ Código limpio y mantenible
```

---

## 4. ✅ Drag & drop actualiza el estado y lo persiste en backend

**¿Qué significa?**  
Cuando arrastras una tarea de una columna a otra, debe:
- Cambiar visualmente en la UI
- Guardar ese cambio en el servidor

**En tu proyecto:**
```typescript
const moveTask = async (id: string, newStatus: TaskStatus) => {
  const previousTasks = [...tasks];
  
  // 1️⃣ Cambio optimista en UI
  setTasks((prev) =>
    prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
  );

  try {
    // 2️⃣ Envía el cambio al servidor (PATCH)
    await updateTask(id, { status: newStatus });
  } catch (err: any) {
    // 3️⃣ Si falla, deshace el cambio
    setTasks(previousTasks);
    setError(err?.message || "Error moviendo tarea");
  }
};
```

**Flow:**
1. Arrastras tarea de TODO a DOING
2. Inmediatamente la ves cambiar (sin esperar al servidor)
3. Servidor recibe la actualización
4. Si el servidor dice "ok", perfecto; si falla, vuelve atrás

---

## 5. ✅ Si falla una llamada al backend, la UI lo gestiona de forma controlada

**¿Qué significa?**  
Si el servidor no responde o hay error:
- No debe romper la app
- Debe mostrar un mensaje de error legible
- Debe permitir reintentar

**En tu proyecto:**

**Manejo de errores al cargar:**
```typescript
useEffect(() => {
  ...
  checkBackend()
    .then(() => getTasks())
    .then((data) => {
      setTasks(data);
      setError(null);  // 👈 Limpia error anterior
    })
    .catch((err: any) => 
      setError(err?.message || "Error conectando al backend")  // 👈 Muestra error amigable
    )
    ...
}, []);
```

**En App.tsx:**
```typescript
if (error) {
  return (
    <div className="app">
      <Header />
      <p className="error">{error}</p>  // 👈 Muestra el error en pantalla
    </div>
  );
}
```

**Rollback automático:**
```typescript
try {
  await updateTask(id, { status: newStatus });
} catch (err: any) {
  setTasks(previousTasks);  // 👈 Vuelve al estado anterior
  setError(err?.message || "Error moviendo tarea");
}
```

---

## 6. ✅ Estilos diferentes por tarea se mantienen

**¿Qué significa?**  
Cada tarea tiene un color único que **persiste** en el backend (no es random cada vez que se carga).

**En tu proyecto:**

**Modelo de datos:**
```typescript
export interface Task {
  id?: string;
  title: string;
  status: TaskStatus;
  color: string;  // 👈 Color único por tarea
}
```

**Al crear:**
```typescript
const newTask = await createTask({
  title,
  status: "TODO",
  color: getRandomColor(),  // 👈 Color random al crear
});
```

**Al mostrar:**
```typescript
<div
  className="task"
  style={{ backgroundColor: task.color }}  // 👈 Aplica el color guardado
  draggable
  onDragStart={handleDragStart}
>
  <p>{task.title}</p>
  ...
</div>
```

**Flujo:**
1. Creas tarea → se asigna color random (ej: `#f87171` rojo)
2. Se guarda en backend junto con la tarea
3. Cierras el navegador
4. Vuelves a abrir → se recarga desde backend con el **mismo color**

---

## 7. ✅ README explica cómo levantar frontend/backend y .env

**¿Qué significa?**  
El README debe ser una guía completa para que alguien sin experiencia pueda:
- Instalar dependencias
- Arrancar la app
- Conectar con un servidor API personalizado

**En tu README (verificado):**

✅ **Paso 1**: Descargar el proyecto (git clone o .zip)  
✅ **Paso 2**: `npm install` (instala dependencias)  
✅ **Paso 3**: `npm run dev` (arranca la app en `localhost:5173`)  
✅ **Paso 4**: Explicación de `.env` y cómo apuntar al servidor:
```env
VITE_API_BASE_URL=http://tu-servidor:3000
```

✅ **Tabla de comandos** disponibles  
✅ **Sección de troubleshooting** con problemas comunes  
✅ **Estructura del proyecto** documentada  
✅ **Tips útiles** para desarrollo  

---

## 🎯 Resumen: Por qué estos requisitos importan

| Requisito | Beneficio |
|-----------|-----------|
| **No localStorage** | Los datos vienen del servidor, no hay inconsistencias |
| **Carga desde API** | La app siempre tiene datos frescos |
| **CRUD contra backend** | Cambios persistentes, no desaparecen al refrescar |
| **Drag & drop persiste** | Las reorganizaciones se guardan para siempre |
| **Gestión de errores** | Si el servidor cae, la app no se rompe, avisa al usuario |
| **Estilos persistentes** | Cada tarea mantiene su identidad visual |
| **README detallado** | Cualquiera puede levantar el proyecto sin ayuda |

---

## ✨ Conclusión

Tu proyecto cumple **todos los requisitos** porque está diseñado como una app profesional que se comunica con un backend real. Esto significa que:

- 🔄 Los datos siempre vienen del servidor (fuente de verdad única)
- 💾 Los cambios se persisten en el backend
- 🛡️ Los errores se manejan gracefully (no se rompe)
- 🎨 La UI es consistente y reactiva
- 📚 El código es documentado y mantenible
