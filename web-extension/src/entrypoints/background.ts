import { showResultModal } from "$lib/services/messaging";
import { saveFullScreenshotIntoStorage } from "$lib/services/screenshot";
import { RuntimeMessage, RuntimeMessageType } from "$lib/types/messages";

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  initializeMessageListener();
});

function initializeMessageListener() {
  browser.runtime.onMessage.addListener(async (message: RuntimeMessage, _sender, sendResponse) => {
    console.log('Received message:', message);

    const result = await (async () => {
      switch (message.type) {
        case RuntimeMessageType.FULL_SCREENSHOT:
          return handleFullScreenshot();
        default:
          return false;
      }
    })();

    sendResponse({ success: result });
    return true;
  });
}

async function handleFullScreenshot(): Promise<boolean> {
  console.log('Taking full screenshot...');
  try {
    await saveFullScreenshotIntoStorage();
    await showResultModal();
    return true;
  } catch (error) {
    console.error('Error taking screenshot:', error);

    return false;
  }
}
