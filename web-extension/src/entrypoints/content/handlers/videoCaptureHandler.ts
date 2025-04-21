import { runtimeMessagingService } from "$lib/services/messaging";
import { createErrorResponse, createSuccessResponse, MessageProcessingResponse } from "$lib/types/messaging/base";
import { ContentScriptContext } from "wxt/client";
import { closeRecordingControlsOverlay, openRecordingControlsOverlay } from "../ui/recordingControls";

export async function handleShowRecordingControlsOverlay(ctx: ContentScriptContext): Promise<MessageProcessingResponse> {
    try {
        await openRecordingControlsOverlay(ctx, async () => {
            await closeRecordingControlsOverlay()
            console.log('Recording controls closed');
            runtimeMessagingService.stopVideoCapture();
        });
        return createSuccessResponse();
    } catch (error) {
        return createErrorResponse((error as Error).message || 'Unknown error');
    }
}