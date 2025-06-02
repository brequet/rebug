import "~/assets/tailwind.css";
import { initializeExternalMessageListener, initializeMessageListener } from "./handlers/messageHandler";
import { handleRecordingInProgress } from "./handlers/videoCaptureHandler";
import { injectRebugResultModal } from "./ui/resultModal";

export default defineContentScript({
  cssInjectionMode: "ui",
  matches: ["*://*/*"],
  runAt: 'document_start',
  async main(ctx) {
    injectRebugResultModal(ctx);

    initializeMessageListener(ctx);
    initializeExternalMessageListener();

    handleRecordingInProgress(ctx);
  },
});
