import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // GitHub project Pages lives below the case-sensitive repository name.
  base: mode === 'demo' ? '/Waimushave/' : '/',
  // Preserve local full-stack development; the demo never calls these routes.
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
}))
