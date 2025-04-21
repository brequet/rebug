import { createErrorResponse, MessageProcessingResponse } from "$lib/types/messaging/base";
import { TabMessage, TabMessageType } from "$lib/types/messaging/tab";
import { ContentScriptContext } from "wxt/client";
import { handleShowResultModal } from "./resultModalHandler";
import { handleStartScreenshotSelection } from "./screenshotHandler";
import { handleShowRecordingControlsOverlay } from "./videoCaptureHandler";

export function initializeMessageListener(ctx: ContentScriptContext) {
    browser.runtime.onMessage.addListener((message: TabMessage, _sender, sendResponse: (response: MessageProcessingResponse) => void) => {
        console.log('[CONTENT] Received message:', message);

        handleMessage(ctx, message)
            .then(result => {
                if (result.error) {
                    console.error('[CONTENT] Error processing message:', result.error);
                }
                sendResponse(result);
            })
            .catch(error => {
                console.error('[CONTENT] Error handling message:', error);
                const errorMessage = error instanceof Error ? error.message : String(error);
                sendResponse(createErrorResponse(errorMessage));
            });

        return true;
    });
}

async function handleMessage(ctx: ContentScriptContext, message: TabMessage): Promise<MessageProcessingResponse> {
    switch (message.type) {
        case TabMessageType.SHOW_RESULT_MODAL:
            return handleShowResultModal(message);
        case TabMessageType.START_SELECTION:
            return handleStartScreenshotSelection(ctx);
        case TabMessageType.SHOW_RECORDING_CONTROLS:
            return handleShowRecordingControlsOverlay(ctx);
        default:
            return createErrorResponse(`Unknown message type: ${(message as any).type}`);
    }
}

