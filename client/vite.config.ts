import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    build: {
      outDir: '../build/client',
      emptyOutDir: true,
    },

    server: {
      host: true,
      port: 6173,
      proxy: {
        '/ws': {
          target: env.VITE_APP_URL,
          changeOrigin: true,
          secure: true,
          ws: true,
        },
        '/api': {
          target: env.VITE_APP_URL,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  }
})
