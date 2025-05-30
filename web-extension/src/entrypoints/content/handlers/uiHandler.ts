import { createErrorResponse, createSuccessResponse, MessageResponse, ResultModalType, ShowRecordingControlsMessage, ShowResultModalMessage } from "$lib/messaging/types";
import { logger } from "$lib/utils/logger";
import { ContentScriptContext } from "wxt/client";
import { contentScriptMessagingService } from "../services/content-messaging.service";
import { closeRecordingControlsOverlay, openRecordingControlsOverlay } from "../ui/recordingControls";
import { openRebugResultModal } from "../ui/resultModal";

const log = logger.getLogger('ContentScript:UiHandler');

export async function handleShowResultModal(message: ShowResultModalMessage): Promise<MessageResponse<void>> {
    log.info(`Handling ${message.type}`, message.payload);
    try {
        if (message.payload.resultType === ResultModalType.VIDEO) {
            await closeRecordingControlsOverlay();
        }

        openRebugResultModal(message);
        return createSuccessResponse();
    } catch (error) {
        return createErrorResponse((error as Error).message || 'Unknown error');
    }
}

export async function handleShowRecordingControlsOverlay(
    message: ShowRecordingControlsMessage,
    ctx: ContentScriptContext
): Promise<MessageResponse<void>> {
    log.info(`Handling ${message.type}`, message.payload);
    try {
        await openRecordingControlsOverlay(
            ctx,
            async () => {
                await closeRecordingControlsOverlay()
                log.debug('Requesting video recording stop...');
                contentScriptMessagingService.requestStopVideoRecording();
            },
            new Date(message.payload.startDate)
        );
        return createSuccessResponse();
    } catch (error) {
        return createErrorResponse((error as Error).message || 'Unknown error');
    }
}