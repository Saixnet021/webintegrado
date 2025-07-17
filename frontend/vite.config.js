import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Polyfill para "global" en navegador
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: {},
  }
});
