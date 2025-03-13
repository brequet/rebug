import tailwindcss from '@tailwindcss/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
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
		})
	],
	root: 'src',
	build: {
		outDir: '../dist',
		emptyOutDir: true,
		rollupOptions: {
			input: {
				popup: resolve(__dirname, 'src/popup/popup.html'),
				screenshot: resolve(__dirname, 'src/screenshot/screenshot.html'),
				background: resolve(__dirname, 'src/background/background.ts'),
				content: resolve(__dirname, 'src/content/content.ts')
			},
			output: {
				entryFileNames: (chunkInfo) => {
					// Keep background.js filename without hash
					if (['background', 'content'].includes(chunkInfo.name)) {
						return `${chunkInfo.name}/${chunkInfo.name}.js`;
					}
					return '[name]/[name].[hash].js';
				}
			}
		}
	}
});
