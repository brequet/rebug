import { createErrorResponse, MessageProcessingResponse } from '$lib/types/messaging/base';
import { RuntimeMessage, RuntimeMessageTarget, RuntimeMessageType } from '$lib/types/messaging/runtime';
import { handleFullScreenshot, handleRegionScreenshot } from './screenshotHandler';
import { handleRecordingStoppedDataReady, handleSetupVideoCapture, isRecordingInProgress } from "./videoCaptureHandler";

export function initializeMessageListener() {
    browser.runtime.onMessage.addListener((message: RuntimeMessage, _sender, sendResponse: (response: MessageProcessingResponse) => void) => {
        if (message.target !== RuntimeMessageTarget.BACKGROUND) {
            return;
        }

        console.log('[BACKGROUND] Received message:', message);

        handleMessage(message)
            .then(result => {
                if (result.error) {
                    console.error('[BACKGROUND] Error processing message:', result.error);
                }
                sendResponse(result);
            })
            .catch(error => {
                console.error('[BACKGROUND] Error handling message:', error);
                const errorMessage = error instanceof Error ? error.message : String(error);
                sendResponse(createErrorResponse(errorMessage));
            });

        return true;
    });
}

async function handleMessage(message: RuntimeMessage): Promise<MessageProcessingResponse> {
    switch (message.type) {
        case RuntimeMessageType.FULL_SCREENSHOT:
            return handleFullScreenshot();
        case RuntimeMessageType.REGION_SCREENSHOT:
            return handleRegionScreenshot(message.region);
        case RuntimeMessageType.SETUP_VIDEO_CAPTURE:
            return handleSetupVideoCapture(message.tabId);
        case RuntimeMessageType.RECORDING_STOPPED_DATA_READY:
            return handleRecordingStoppedDataReady(message);
        case RuntimeMessageType.IS_RECORDING_IN_PROGRESS:
            return isRecordingInProgress();
        default:
            return createErrorResponse(`Unknown message type: ${(message as any).type}`);
    }
}