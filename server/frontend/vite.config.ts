import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	// TODO: checks this works
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true,
			},
			'/uploads': {
				target: 'http://localhost:3000',
				changeOrigin: true,
			}
		}
	}
});
