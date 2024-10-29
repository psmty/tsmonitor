// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

// import node from '@astrojs/node';
import cloudflare from '@astrojs/cloudflare';
import auth from 'auth-astro';

import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), vue(), auth()],
  output: 'server',
  adapter: cloudflare(),

  vite: {
    build: {
      minify: false,
    },
    ssr: {
      external: ['node:path'],
    },
    define: {
      "process.env": process.env
    }
  },
});