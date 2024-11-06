import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import node from '@astrojs/node';
import auth from 'auth-astro';

import vue from '@astrojs/vue';


// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), vue(), auth()],
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
    // define: {
    //   "process.env": process.env
    // }
  },
});
