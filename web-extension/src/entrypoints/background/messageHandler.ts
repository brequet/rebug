import { RuntimeMessage, RuntimeMessageType } from "$lib/types/messages";
import { handleFullScreenshot, handleRegionScreenshot } from './screenshotHandlers';

export function initializeMessageListener() {
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