import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // o front chama /api/... e o Vite repassa para a API: sem problema de CORS
  server: { proxy: { '/api': 'http://localhost:3333' } },
});
