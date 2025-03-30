import { MessageProcessingResponse, RuntimeMessage, RuntimeMessageType } from "$lib/types/messages";
import { handleFullScreenshot, handleRegionScreenshot } from './screenshotHandlers';
import { handleStartCapture, handleStopCapture } from "./videoCaptureHandlers";

export function initializeMessageListener() {
    browser.runtime.onMessage.addListener(async (message: RuntimeMessage, _sender, sendResponse: (response: MessageProcessingResponse) => void) => {
        console.log('Received message:', message);

        handleMessage(message)
            .then(result => sendResponse(result))
            .catch(error => {
                console.error('Error handling message:', error);
                sendResponse({ success: false, error: error.message });
            });

        // Return true to indicate we'll send a response asynchronously
        return true;
    });
}

async function handleMessage(message: RuntimeMessage): Promise<MessageProcessingResponse> {
    switch (message.type) {
        case RuntimeMessageType.FULL_SCREENSHOT:
            return handleFullScreenshot();
        case RuntimeMessageType.REGION_SCREENSHOT:
            return handleRegionScreenshot(message.region);
        case RuntimeMessageType.START_VIDEO_CAPTURE:
            return handleStartCapture();
        case RuntimeMessageType.STOP_VIDEO_CAPTURE:
            return handleStopCapture();
        default:
            const errorMessage = `Unknown message type: ${(message as any).type}`
            console.warn(errorMessage);
            return { success: false, error: errorMessage };
    }
}