import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base path for GitHub Pages project site: https://vivekcmw.github.io/MWCinema/
// Override with VITE_BASE=/ for local/root deployments.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/MWCinema/',
  plugins: [react()],
  server: { port: 5173, open: true }
});
