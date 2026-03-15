import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    server: {
    port: 3000,       
    strictPort: false, // Allow auto-switching to next available port
  },
})
