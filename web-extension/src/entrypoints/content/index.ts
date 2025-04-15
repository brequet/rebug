import "~/assets/tailwind.css";
import { initializeMessageListener } from "./messageHandler";
import { injectRebugResultModal } from "./ui/resultModal";

export default defineContentScript({
  cssInjectionMode: "ui",
  matches: ["*://*/*"],
  async main(ctx) {
    console.log('Hello content.');

    injectRebugResultModal(ctx);

    initializeMessageListener(ctx);
  },
});

