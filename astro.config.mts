import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import node from '@astrojs/node';
// import cloudflare from '@astrojs/cloudflare';
import auth from 'auth-astro';

import vue from '@astrojs/vue';


// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), vue(), auth()],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  // adapter: cloudflare({
  //   platformProxy: {
  //     enabled: true,
  //   }
  // }),
  vite: {
    ssr: {
      // true for production
      noExternal: import.meta.env.PROD ? true : undefined,
      // cloudflare
      // external: ['node:path'],
    },
    // cloudflare
    // define: {
    //   "process.env": process.env
    // }
  },
});
