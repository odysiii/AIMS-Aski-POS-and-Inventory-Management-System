import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    // Guards against a duplicate React copy without hardcoding an install path.
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true, // Listens on all network interfaces
    allowedHosts: true, // Allows VS Code forwarded URLs to load assets
  },
})
