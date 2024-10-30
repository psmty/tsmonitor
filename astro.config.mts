// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

import node from '@astrojs/node';
import auth from 'auth-astro';

import vue from '@astrojs/vue';


// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), vue(), auth()],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    ssr: {
      noExternal: true
    },
    // define: {
    //   "process.env": process.env
    // }
  },
});
