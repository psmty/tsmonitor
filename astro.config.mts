import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import node from '@astrojs/node';
import auth from 'auth-astro';

import vue from '@astrojs/vue';


// https://astro.build/config
export default defineConfig({
  site: 'https://monitor.rv-grid.com',
  integrations: [tailwind(), vue({ appEntrypoint: '/src/pages/_app' }), auth()],
  output: 'server',
  base: '/',
  adapter: node({ mode: 'standalone' }),
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler' // or "modern"
        }
      }
    },
    ssr: {
      // true for production
      noExternal: import.meta.env.PROD ? true : undefined
    },
    build: {
      rollupOptions: {
        // Modify the chunking strategy here
        output: {
          // This prevents Rollup from creating separate chunks for libraries
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              return 'vendor'; // All node_modules code will be bundled into a 'vendor' chunk
            }
          },
        },
      },
    },
    // define: {
    //   "process.env": process.env
    // }
  },
});
