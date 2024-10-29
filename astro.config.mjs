// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

import node from '@astrojs/node';
import auth from 'auth-astro';

import vue from '@astrojs/vue';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), auth(), vue()],
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  vite: {
    plugins: [libInjectCss()],
  }
});