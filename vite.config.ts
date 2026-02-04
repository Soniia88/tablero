import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // process.env.VITE_API_BASE_URL se puede cargar desde .env
  // Si la variable está vacía (p.e. .env.development con VITE_API_BASE_URL=), usamos el host por defecto para el proxy
  const target = process.env.VITE_API_BASE_URL || 'http://localhost:8080';

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Proxyea peticiones /tasks a tu backend para evitar problemas de CORS en desarrollo
        '/tasks': {
          target,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
})
