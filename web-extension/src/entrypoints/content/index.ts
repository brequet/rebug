import ScreenshotOverlay from "$lib/components/ScreenshotOverlay.svelte";
import { initiateRegionScreenshot } from "$lib/services/messaging";
import { screenshot } from "$lib/services/storage";
import { modalStore } from "$lib/stores/modal.store";
import { TabMessage, TabMessageType } from "$lib/types/messages";
import { SelectionArea } from "$lib/types/screenshot";
import { mount } from "svelte";
import { ContentScriptContext, ShadowRootContentScriptUi } from "wxt/client";
import "~/assets/tailwind.css";
import ResultModal from "./ResultModal.svelte";

export default defineContentScript({
  cssInjectionMode: "ui",
  matches: ["*://*/*"],
  async main(ctx) {
    console.log('Hello content.');

    const rebugResultModalUi = await createRebugResultModalUi(ctx);
    rebugResultModalUi.mount();

    initializeMessageListener(ctx);
  },
});

function initializeMessageListener(ctx: ContentScriptContext) {
  browser.runtime.onMessage.addListener(async (message: TabMessage, _sender, sendResponse) => {
    console.log('Received message:', message);

    const result = await (async () => {
      switch (message.type) {
        case TabMessageType.SHOW_RESULT_MODAL:
          handleShowResultModal();
          break;
        case TabMessageType.START_SELECTION:
          handleStartScreenshotSelection(ctx);
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

async function handleStartScreenshotSelection(ctx: ContentScriptContext): Promise<unknown> {
  console.log('Starting screenshot selection...');

  return new Promise<SelectionArea>((resolve, reject) => {
    let ui: ShadowRootContentScriptUi<{}>;

    const onComplete = (selectionArea: SelectionArea) => {
      ui.remove();
      resolve(selectionArea);
    };

    const onCancel = () => {
      ui.remove();
      reject(new Error('Screenshot selection cancelled'));
    };

    createShadowRootUi(ctx, {
      name: 'rebug-screenshot-overlay-ui',
      position: 'inline',
      anchor: 'body',
      onMount: (container) => {
        return mount(ScreenshotOverlay, {
          target: container,
          props: { onComplete, onCancel }
        });
      },
    }).then(createdUi => {
      ui = createdUi;
      ui.mount();
    });
  }).then(async (selectionArea) => {
    console.log('Screenshot selection area:', selectionArea);
    await initiateRegionScreenshot(selectionArea)
  }
  ).catch((error) => {
    console.error('Error during screenshot selection:', error);
    throw error;
  });
}
