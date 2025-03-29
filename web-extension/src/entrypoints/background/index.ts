import { initializeMessageListener } from "./messageHandler";

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  initializeMessageListener();
});

