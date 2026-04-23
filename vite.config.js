import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts:['arrivals-sleep-transportation-duration.trycloudflare.com'],
    proxy: {
      '/api': {
        target: 'https://erph-backend-pujs.onrender.com',
        changeOrigin: true,
      }
    }
  }
})
