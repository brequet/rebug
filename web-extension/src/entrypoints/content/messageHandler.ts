import { MessageProcessingResponse, TabMessage, TabMessageType } from "$lib/types/messages";
import { ContentScriptContext } from "wxt/client";
import { handleShowResultModal } from "./handlers/resultModalHandler";
import { handleStartScreenshotSelection } from "./handlers/screenshotHandler";
import { startRecording } from "./handlers/videoCaptureHandler";

export function initializeMessageListener(ctx: ContentScriptContext) {
    browser.runtime.onMessage.addListener(async (message: TabMessage, _sender, sendResponse) => {
        console.log('Received message:', message);

        handleMessage(ctx, message)
            .then(sendResponse)
            .catch(error => {
                console.error('Error handling message:', error);
                sendResponse({ success: false, error: error.message });
            });

        return true;
    });
}

async function handleMessage(ctx: ContentScriptContext, message: TabMessage): Promise<MessageProcessingResponse> {
    switch (message.type) {
        case TabMessageType.SHOW_RESULT_MODAL:
            return handleShowResultModal(message.resultModalType);
        case TabMessageType.START_SELECTION:
            return handleStartScreenshotSelection(ctx);
        case TabMessageType.STREAM_ID_RECEIVED:
            return startRecording(ctx, message.streamId);
        // case TabMessageType.SHOW_RECORDING_CONTROLS:
        //     return handleShowRecordingControlsOverlay(ctx);
        default:
            const errorMessage = `Unknown message type: ${(message as any).type}`
            console.warn(errorMessage);
            return { success: false, error: errorMessage };
    }
}
