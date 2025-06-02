import "~/assets/tailwind.css";
import { initializeMessageListener } from "./handlers/messageHandler";
import { handleRecordingInProgress } from "./handlers/videoCaptureHandler";
import { injectRebugResultModal } from "./ui/resultModal";

export default defineContentScript({
  cssInjectionMode: "ui",
  matches: ["*://*/*"],
  runAt: 'document_start',
  async main(ctx) {
    injectRebugResultModal(ctx);

    initializeMessageListener(ctx);

    handleRecordingInProgress(ctx);

    if (typeof window !== 'undefined') {
      window.addEventListener('message', externalMessageListener, false);
      console.log('Rebug Extension: Content script listening for messages from web app.');
    } else {
      console.error('Rebug Extension: Window object is not available. Content script cannot set ready flag or listen for messages.');
    }
  },
});

// TODO clean refactor this
function externalMessageListener(event: MessageEvent) {
  console.log('Rebug Extension: Content script received message:', event);

  // Validate message origin
  // if (event.source !== window || event.origin !== window.location.origin) {
  //   // console.debug('Rebug Extension: Message from unknown source/origin ignored.', event.origin, event.data);
  //   return;
  // }

  // const message = event.data as Partial<ReceivedMessage>;

  // // Validate message structure and source
  // if (
  //   !message ||
  //   typeof message !== 'object' ||
  //   message.source !== EXPECTED_WEB_APP_SOURCE ||
  //   !message.type
  // ) {
  //   // console.debug('Rebug Extension: Non-app message ignored or invalid structure.', message);
  //   return;
  // }

  // console.log('Rebug Extension: Content script received message from web app:', message);

  // try {
  //   browser.runtime.sendMessage(message).catch((error) => {
  //     console.error('Rebug Extension: Error forwarding message to background:', error, message);
  //     // This can happen if the extension is reloaded or background is inactive
  //     // Implement retry or error reporting if needed.
  //   });
  // } catch (error) {
  //   console.error('Rebug Extension: Failed to send message to background script:', error);
  //   // This might indicate the extension context is invalidated (e.g., during an update)
  // }
}

