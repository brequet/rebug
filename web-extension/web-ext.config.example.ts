import { resolve } from 'node:path';
import { defineWebExtConfig } from 'wxt';

export default defineWebExtConfig({
    chromiumProfile: resolve('.wxt/chrome-data'),
    keepProfileChanges: true,
    chromiumArgs: ["--new-tab=https://localhost:5173"],
    startUrls: ["localhost:5173"],
});