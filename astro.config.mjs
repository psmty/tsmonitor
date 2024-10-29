// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

// import node from '@astrojs/node';
import cloudflare from '@astrojs/cloudflare';
import auth from 'auth-astro';

import vue from '@astrojs/vue';

import db from '@astrojs/db';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), vue(), auth(), db()],
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