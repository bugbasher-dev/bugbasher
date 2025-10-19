import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import { fontless } from 'fontless'

import cloudflare from '@astrojs/cloudflare'

export default defineConfig({
	output: 'server',
	site: 'https://epic-stack.me',
	integrations: [react()],

	vite: {
		plugins: [tailwindcss(), fontless()],
		server: {
			allowedHosts: ['epic-stack.me', 'localhost'],
		},
	},

	adapter: cloudflare(),
})
