import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/hr-recruitment/',
  server: {
    port: 5173,
    host: true,
    allowedHosts: 'all',
    proxy: { '/api': 'http://localhost:8000' },
  },
});
