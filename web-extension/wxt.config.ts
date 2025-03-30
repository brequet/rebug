import tailwindcss from '@tailwindcss/vite';
import path from "path";
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    host_permissions: ['<all_urls>'],
    permissions: ['storage', 'activeTab', "desktopCapture"],
  },
  vite: () => ({
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        $lib: path.resolve("./src/lib"),
      },
    },
  }),
  srcDir: 'src',
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-svelte'],
});
