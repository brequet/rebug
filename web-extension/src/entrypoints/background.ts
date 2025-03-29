import { showResultModal } from "$lib/services/messaging";
import { screenshot } from "$lib/services/storage";
import { RuntimeMessage, RuntimeMessageType } from "$lib/types/messages";
import { SCREENSHOT_FORMAT, SCREENSHOT_MIME_TYPE, SelectionArea } from "$lib/types/screenshot";

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  initializeMessageListener();
});

function initializeMessageListener() {
  browser.runtime.onMessage.addListener(async (message: RuntimeMessage, _sender, sendResponse) => {
    console.log('Received message:', message);

    handleMessage(message)
      .then(result => sendResponse({ success: result }))
      .catch(error => {
        console.error('Error handling message:', error);
        sendResponse({ success: false, error: error.message });
      });

    // Return true to indicate we'll send a response asynchronously
    return true;
  });
}

async function handleMessage(message: RuntimeMessage): Promise<boolean> {
  switch (message.type) {
    case RuntimeMessageType.FULL_SCREENSHOT:
      return handleFullScreenshot();
    case RuntimeMessageType.REGION_SCREENSHOT:
      return handleRegionScreenshot(message.region);
    default:
      console.warn(`Unknown message type: ${(message as any).type}`);
      return false;
  }
}

async function handleFullScreenshot(): Promise<boolean> {
  console.log('Taking full screenshot...');
  try {
    const dataUrl = await browser.tabs.captureVisibleTab({ format: SCREENSHOT_FORMAT });
    await screenshot.setValue(dataUrl);
    await showResultModal();
    return true;
  } catch (error) {
    console.error('Error taking screenshot:', error);

    return false;
  }
}

async function handleRegionScreenshot(region: SelectionArea): Promise<boolean> {
  console.log('Taking region screenshot...', { region });

  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];

    if (!activeTab?.id) {
      throw new Error('No active tab found');
    }

    const dataUrl = await browser.tabs.captureVisibleTab({ format: SCREENSHOT_FORMAT });
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    const imageBitmap = await createImageBitmap(blob);

    // Create offscreen canvas - adjust for device pixel ratio
    const canvas = new OffscreenCanvas(region.width, region.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }

    const scaledRegion = {
      left: region.x * region.devicePixelRatio,
      top: region.y * region.devicePixelRatio,
      width: region.width * region.devicePixelRatio,
      height: region.height * region.devicePixelRatio
    };

    console.log('captureRegion (scaled):', scaledRegion);

    ctx.drawImage(
      imageBitmap,
      scaledRegion.left,
      scaledRegion.top,
      scaledRegion.width,
      scaledRegion.height,
      0,
      0,
      region.width,
      region.height
    );

    const croppedBlob = await canvas.convertToBlob({ type: SCREENSHOT_MIME_TYPE });
    const reader = new FileReader();
    const croppedDataUrl = await new Promise<string>((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(croppedBlob);
    });

    await screenshot.setValue(croppedDataUrl);
    await showResultModal();
    return true;
  } catch (error) {
    console.error('Error taking region screenshot:', error);
    return false;
  }
}
