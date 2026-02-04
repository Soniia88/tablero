# React + TypeScript + Vite

1. `git clone` → descarga el código
2. `npm install` → instala **todas** las dependencias necesarias
3. `npm run dev` → ejecuta Vite y React

---

💡 Para desarrollo con una API local puedes usar `json-server` (no viene instalado por defecto):

- Arranca la API de ejemplo con:

```
npx json-server --watch db.json --port 8080
```

- O usa el script del proyecto:

```
npm run api
```

La app lee la URL base desde `.env` (clave `VITE_API_BASE_URL`). Si modificas `.env` reinicia `npm run dev` para que Vite recoja los cambios.

---

⚠️ Si en el navegador ves `Failed to fetch` o la app no carga tareas, comprueba lo siguiente:

1. ¿Has arrancado la API mock? Ejecuta en otra terminal:

```
npm run api
```

(El script usa `npx json-server` para no necesitar instalación global; si prefieres instala `json-server` con `npm i -D json-server`.)

2. ¿El endpoint responde? Abre `http://localhost:8080/tasks` en el navegador: debe devolver JSON.
3. Revisa la pestaña Network en DevTools: verifica la URL solicitada y el status.
4. Asegúrate de reiniciar Vite si cambiaste `.env`: `npm run dev`.
5. Si ves una página HTML en la respuesta (por ejemplo `index.html`), la URL base está mal (probablemente tiene `/tasks` de más). Asegúrate de que `.env` sea `VITE_API_BASE_URL=http://localhost:8080`.

💡 Para evitar problemas de CORS durante desarrollo, este proyecto incluye un proxy en `vite.config.ts` que redirige las peticiones a `/tasks` hacia la URL indicada en `.env`. Reinicia `npm run dev` para que el proxy entre en efecto.

Si tras esto sigue fallando, pega aquí la URL que muestra en Network y el texto completo del error de la consola para que lo revise.

---

## 📦 Cambios aplicados (detallado)
- **`.env`**: configurada para apuntar al backend real en producción (por ejemplo `VITE_API_BASE_URL=http://localhost:8080`).
- **`.env.development`**: creada y dejada vacía (`VITE_API_BASE_URL=`) para forzar que en desarrollo la app use rutas relativas y el **proxy de Vite** (evita CORS en dev).
- **`src/api/tasksApi.ts`**:
  - Normaliza la `BASE_URL` (quita slash final).
  - Añadido `parseResponse` para validar `content-type` y lanzar errores con el body (útil para detectar HTML/errores del servidor).
  - Añadida `checkBackend()` para comprobar conectividad, detectar timeouts y distinguir errores de CORS.
- **`src/hooks/useTasks.ts`**: ahora llama `checkBackend()` antes de `getTasks()` y muestra errores amigables en la UI.
- **`vite.config.ts`**: añadido un **proxy dev** que redirige `/tasks` a la URL de `VITE_API_BASE_URL` (o `http://localhost:8080` si la variable está vacía) para evitar CORS durante el desarrollo.
- **`db.json`** (ejemplo) y script `npm run api` (usa `npx json-server ...`) quedaron en el repo como opción de mock local si se necesita para pruebas rápidas.

## 🧪 Cómo probar localmente
1. Si trabajas con tu **backend real**: ajusta `.env` con la URL base y reinicia Vite: `npm run dev`.
2. Si necesitas evitar CORS durante desarrollo y tu backend corre en `http://localhost:8080`: deja `.env.development` con `VITE_API_BASE_URL=` y reinicia `npm run dev` para que Vite use el proxy y las peticiones a `/tasks` se reenvíen al backend.
3. Revisa DevTools → Network → `GET /tasks` debe devolver `200` y `Content-Type: application/json`.

## 📁 Archivo con los cambios
He creado un archivo comprimido con el estado del proyecto tras aplicar las correcciones: **`tablero-with-fixes.zip`** (en la raíz del proyecto). Contiene todos los archivos modificados.

## 📝 Notas adicionales
- La solución definitiva en producción es **habilitar CORS** en el backend (añadir `Access-Control-Allow-Origin` o configurar origin específico). El proxy es solo para facilitar development.
- Si quieres que haga un PR con los cambios (o un commit separado) dímelo y lo preparo.

Si necesitas más detalle de cualquier cambio (línea a línea), lo preparo y te lo explico.
