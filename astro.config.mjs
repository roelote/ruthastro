// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
    assetsInclude: ['**/*.webp', '**/*.jpg', '**/*.jpeg', '**/*.png'],
    build: {
      assetsInlineLimit: 0, // Asegurar que todos los assets se copien al build
      rollupOptions: {
        output: {
          assetFileNames: '_astro/[name].[hash][extname]'
        }
      }
    }
  },
  build: {
    assets: '_astro',
    inlineStylesheets: 'auto'
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    },
    domains: ['cms.ruthamazonexpeditions.com']
  }
});