import { ResultModalType, TabMessage, TabMessageType } from "$lib/types/messages";
import { ContentScriptContext } from "wxt/client";
import { handleStartScreenshotSelection } from "./handlers/screenshotHandler";
import { startRecording } from "./handlers/videoCaptureHandler";
import { openRebugResultModal } from "./ui/resultModal";

export function initializeMessageListener(ctx: ContentScriptContext) {
    browser.runtime.onMessage.addListener(async (message: TabMessage, _sender, sendResponse) => {
        console.log('Received message:', message);

        handleMessage(ctx, message)
            .then(result => sendResponse({ success: result }))
            .catch(error => {
                console.error('Error handling message:', error);
                sendResponse({ success: false, error: error.message });
            });

        return true;
    });
}

async function handleMessage(ctx: ContentScriptContext, message: TabMessage): Promise<boolean> {
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
            console.warn(`Unknown message type: ${(message as any).type}`);
            return false;
    }
}

async function handleShowResultModal(resultModalType: ResultModalType): Promise<boolean> {
    console.log('Showing result modal...');
    try {
        openRebugResultModal(resultModalType);
        return true
    } catch (error) {
        console.error('Error opening result modal:', error);
        return false;
    }
}

