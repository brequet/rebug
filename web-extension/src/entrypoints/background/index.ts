import { initializeMessageListener } from "./handlers/messageHandler";

export default defineBackground(() => {
  console.log('[BACKGROUND] Background running', { id: browser.runtime.id });

  initializeMessageListener();
});
