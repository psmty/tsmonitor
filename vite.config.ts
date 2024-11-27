// vite.config.ts
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      // Entry point of your library
      entry: path.resolve(__dirname, 'src/crawler/server/index.ts'),
      // Global variable name for UMD/IIFE builds (optional)
      name: 'TempusMonitor',
      // Output file names
      fileName: (format) => `tempus-monitor.${format}.js`,
    },
    rollupOptions: {
      // Externalize dependencies to avoid bundling them
      external: ['axios', 'cheerio'], // Add your external dependencies here
      output: {
        // Provide global variables for UMD/IIFE builds (if needed)
        globals: {
          axios: 'axios',
          cheerio: 'cheerio',
        },
      },
    },
  },
});
