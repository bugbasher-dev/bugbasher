import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { fontless } from 'fontless';

export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss(), fontless()],
  },
});
