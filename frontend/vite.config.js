import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,       // FORCEM EL PORT 3000
    strictPort: true, // Si està ocupat, avisarà en lloc de canviar
    host: true
  }
})