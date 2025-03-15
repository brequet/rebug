import tailwindcss from '@tailwindcss/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import liveReload from 'vite-plugin-live-reload';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ command }) => {
	const isProduction = command === 'build';

	return {
		plugins: [
			tailwindcss(),
			svelte(),
			viteStaticCopy({
				targets: [
					{
						src: 'public/*',
						dest: ''
					},
					{
						src: 'content/*.css',
						dest: 'content'
					}
				]
			}),
			// Add live reload for development
			!isProduction && liveReload('src/**/*.{svelte,ts,js,css,html}')
		],
		root: 'src',
		build: {
			outDir: '../dist',
			emptyOutDir: true,
			rollupOptions: {
				input: isProduction
					? {
							popup: resolve(__dirname, 'src/popup/popup.html'),
							screenshot: resolve(__dirname, 'src/screenshot/screenshot.html'),
							background: resolve(__dirname, 'src/background/background.ts'),
							content: resolve(__dirname, 'src/content/content.ts')
						}
					: {
							dev: resolve(__dirname, 'src/dev/dev.html')
						},
				output: {
					entryFileNames: (chunkInfo) => {
						if (isProduction && ['background', 'content'].includes(chunkInfo.name)) {
							return `${chunkInfo.name}/${chunkInfo.name}.js`;
						}
						return '[name]/[name].[hash].js';
					}
				}
			}
		},
		server: {
			port: 5173,
			open: '/dev.html'
		}
	};
});
