import "~/assets/tailwind.css";
import { initializeMessageListener } from "./handlers/messageHandler";
import { injectRebugResultModal } from "./ui/resultModal";

export default defineContentScript({
  cssInjectionMode: "ui",
  matches: ["*://*/*"],
  async main(ctx) {
    injectRebugResultModal(ctx);

    initializeMessageListener(ctx);
  },
});

