import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Relative base + HashRouter: the build works on GitHub Pages under any repository name
// (https://<user>.github.io/<repo>/) and also on a custom domain, without extra config.
export default defineConfig({
  base: './',
  plugins: [react()],
});
