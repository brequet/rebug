import { createErrorResponse, MessageProcessingResponse } from '$lib/types/messaging/base';
import { RuntimeMessage, RuntimeMessageTarget, RuntimeMessageType } from '$lib/types/messaging/runtime';
import { startRecording, stopRecording } from './videoCaptureHandler';

export function initializeMessageListener() {
    browser.runtime.onMessage.addListener((message: RuntimeMessage, _sender, sendResponse: (response: MessageProcessingResponse) => void) => {
        if (message.target !== RuntimeMessageTarget.OFFSCREEN) {
            return;
        }

        console.log('[OFFSCREEN] Received message:', message);

        handleMessage(message)
            .then(result => {
                if (result.error) {
                    console.error('[OFFSCREEN] Error processing message:', result.error);
                }
                sendResponse(result);
            })
            .catch(error => {
                console.error('[OFFSCREEN] Error handling message:', error);
                const errorMessage = error instanceof Error ? error.message : String(error);
                sendResponse(createErrorResponse(errorMessage));
            });

        return true;
    });
}

async function handleMessage(message: RuntimeMessage): Promise<MessageProcessingResponse> {
    switch (message.type) {
        case RuntimeMessageType.START_VIDEO_CAPTURE:
            return startRecording();
        case RuntimeMessageType.STOP_VIDEO_CAPTURE:
            return stopRecording();
        default:
            return createErrorResponse(`Unknown message type: ${(message as any).type}`);
    }
}