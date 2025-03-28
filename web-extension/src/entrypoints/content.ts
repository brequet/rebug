import { screenshot } from "$lib/services/storage";
import { modalStore } from "$lib/stores/modal.store";
import { TabMessage, TabMessageType } from "$lib/types/messages";
import { mount } from "svelte";
import { ContentScriptContext, ShadowRootContentScriptUi } from "wxt/client";
import "~/assets/tailwind.css";
import ResultModal from "./content/ResultModal.svelte";

export default defineContentScript({
  cssInjectionMode: "ui",
  matches: ["*://*/*"],
  async main(ctx) {
    console.log('Hello content.');

    const rebugResultModalUi = await createRebugResultModalUi(ctx);
    rebugResultModalUi.mount();

    initializeMessageListener();
  },
});

function initializeMessageListener() {
  browser.runtime.onMessage.addListener(async (message: TabMessage, _sender, sendResponse) => {
    console.log('Received message:', message);

    const result = await (async () => {
      switch (message.type) {
        case TabMessageType.SHOW_RESULT_MODAL:
          handleShowResultModal();
          break;
        case TabMessageType.START_SELECTION:
          handleStartScreenshotSelection();
          break;
      }
    })();

    sendResponse({ success: result });
    return true;
  });
}

async function handleShowResultModal() {
  console.log('Showing result modal...');
  try {
    const imageString = await screenshot.getValue();
    if (!imageString) {
      throw new Error('No screenshot found in storage');
    }

    modalStore.open({ imageString })
  } catch (error) {
    console.error('Error opening result modal:', error);
  }
}

async function createRebugResultModalUi(ctx: ContentScriptContext): Promise<ShadowRootContentScriptUi<void>> {
  return createShadowRootUi(ctx, {
    name: 'rebug-result-modal-ui',
    position: 'inline',
    anchor: 'body',
    onMount: (container) => {
      mount(ResultModal, {
        target: container,
      });
    },
  });
}

async function handleStartScreenshotSelection() {
  console.log('Starting screenshot selection...');
  throw new Error('Not implemented');
}