// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://ruthamazonexpeditions.com',

  redirects: {
    '/inicio/': { status: 301, destination: '/' },
    '/en/home/': { status: 301, destination: '/en/' },
  },

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: []
});