# 📋 Tablero de Tareas - React + TypeScript + Vite

Bienvenido a este proyecto. Es una **aplicación web para gestionar tareas** (como un tablero de notas). Las tareas se organizan en columnas (estados) y puedes arrastrarlas de una a otra.

---

## 🚀 ¿Qué necesito para empezar?

Antes de nada, asegúrate de tener instalado:
- **Node.js** (descárgalo desde https://nodejs.org) - incluye `npm` que usaremos para instalar cosas
- **Git** (opcional, pero útil para descargar el código) - https://git-scm.com

---

## 📥 Paso 1: Descargar y preparar el proyecto

Abre una **terminal** (en Windows: PowerShell, CMD, o la terminal de VS Code) y ejecuta:

```bash
# Si tienes Git instalado, descarga el proyecto:
git clone <url-del-repositorio>
cd tablero

# Si no, descarga el archivo .zip, descomprímelo y abre la carpeta en la terminal
```

---

## 🔧 Paso 2: Instalar las dependencias

Las "dependencias" son librerías de código que el proyecto necesita para funcionar (React, TypeScript, etc.). Para instalarlas, ejecuta:

```bash
npm install
```

Esto descargará y instalará todo lo necesario. Verás una carpeta `node_modules/` que se crea automáticamente (no la toques, es solo para la máquina).

---

## ▶️ Paso 3: Ejecutar la aplicación

Una vez instalado, arranca el servidor de desarrollo con:

```bash
npm run dev
```

Verás algo como:
```
  VITE v4.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Abre tu navegador y ve a `http://localhost:5173/` - ¡verás la app funcionando!

---

## 🔌 Paso 4: Conectar con tu servidor (API)

La app necesita obtener las tareas de algún lado. Para ello necesitas una **API** (un servidor que proporciona datos).

Edita el archivo `.env`:

```env
VITE_API_BASE_URL=http://tu-servidor:3000
```

(Reemplaza `http://tu-servidor:3000` con la dirección real de tu servidor)

Luego **reinicia** `npm run dev` para que lea el cambio.

**Nota:** Los endpoints esperados por la API son:
- `GET /tasks` - Obtiene todas las tareas
- `POST /tasks` - Crea una nueva tarea
- `PUT /tasks/:id` - Actualiza una tarea existente
- `DELETE /tasks/:id` - Elimina una tarea

---

## 🛠️ Comandos útiles

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Inicia la app en modo desarrollo (ve a http://localhost:5173) |
| `npm run build` | Prepara la app para producción (genera una carpeta `dist/`) |
| `npm run lint` | Revisa el código en busca de errores |

---

## ⚠️ Algo no funciona: Guía de solución de problemas

### Problema 1: "Failed to fetch" o la app no carga tareas

**Causa**: La API no está ejecutándose, no es accesible, o la app no sabe dónde conectar.

**Solución**:
1. Verifica que tu servidor esté ejecutándose y accesible
2. Comprueba que `.env` tiene la URL correcta: `VITE_API_BASE_URL=http://tu-servidor:puerto`
3. Presiona `Ctrl+C` en la terminal donde corre `npm run dev`
4. Ejecuta nuevamente: `npm run dev` para que cargue el nuevo `.env`
5. Abre la página en el navegador y mira la consola (F12) para ver el error exacto

### Problema 2: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Causa**: El backend no permite solicitudes desde `http://localhost:5173` (donde corre React).

**Solución**: Configura CORS en tu backend (Spring Boot):

Crea un archivo `CorsConfig.java` en tu proyecto:

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

Luego **reinicia tu backend** para que los cambios tomen efecto.

### Problema 3: "Port already in use" (puerto en uso)

**Causa**: Otro programa ya usa el puerto 5173 o 8080.

**Solución A** (mata el proceso):
```bash
# En Windows, en PowerShell:
Get-Process | Where-Object {$_.Port -eq 5173} | Stop-Process -Force
```

**Solución B** (usa otro puerto):
```bash
npm run dev -- --port 3000
```

### Problema 3: Cambié `.env` pero nada cambia

**Causa**: Vite cachea los cambios, necesita reiniciarse.

**Solución**:
1. Presiona `Ctrl+C` en la terminal donde corre `npm run dev`
2. Ejecuta nuevamente: `npm run dev`

### Problema 4: Veo errores de TypeScript pero la app funciona

**Normal**. TypeScript te avisa de posibles problemas durante el desarrollo. No impide que la app funcione, pero es bueno arreglarlo.

---

## 📁 Estructura del proyecto

```
tablero/
├── src/
│   ├── api/
│   │   └── tasksApi.ts          ← Código para conectar con la API
│   ├── components/              ← Componentes de la interfaz (botones, formularios, etc.)
│   │   ├── board.tsx
│   │   ├── column.tsx
│   │   ├── header.tsx
│   │   ├── taskCard.tsx
│   │   └── taskForm.tsx
│   ├── hooks/
│   │   └── useTasks.ts          ← Lógica para obtener y gestionar tareas
│   ├── models/
│   │   └── task.ts              ← Definición de qué es una "tarea"
│   ├── App.tsx                  ← Componente principal
│   ├── main.tsx                 ← Punto de entrada
│   └── ... (estilos y otros)
├── .env                          ← Configuración (URL de la API)
├── vite.config.ts               ← Configuración de Vite
├── tsconfig.json                ← Configuración de TypeScript
├── package.json                 ← Lista de dependencias y scripts
└── README.md                     ← Este archivo
```

**En resumen**:
- **`src/`**: Todo el código de la app
- **`.env`**: Configuración (dónde está tu servidor API)
- **`package.json`**: Instrucciones de qué instalar y qué comandos ejecutar

---

## 💡 Tips

1. **Abre la consola del navegador** (F12) para ver errores: te ayudará a entender qué va mal
2. **Los cambios en el código se ven automáticamente**: no necesitas reiniciar, Vite se encarga
3. **Si cambias `.env`**: reinicia `npm run dev` para que cargue la nueva configuración
4. **Verifica la conexión**: abre `http://localhost:5173` y mira la pestaña Network en DevTools (F12) para ver si las peticiones a la API tienen éxito

