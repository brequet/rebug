import "~/assets/tailwind.css";
import { initializeMessageListener } from "./messageHandlers";
import { injectRebugResultModal } from "./resultModal";

export default defineContentScript({
  cssInjectionMode: "ui",
  matches: ["*://*/*"],
  async main(ctx) {
    console.log('Hello content.');

    injectRebugResultModal(ctx);

    initializeMessageListener(ctx);
  },
});

