import { isErrorResponse } from "$lib/messaging/types";
import { logger } from "$lib/utils/logger";
import { ContentScriptContext } from "wxt/client";
import { contentScriptMessagingService } from "../services/content-messaging.service";
import { closeRecordingControlsOverlay, openRecordingControlsOverlay } from "../ui/recordingControls";

const log = logger.getLogger('ContentScript:VideoCaptureHandler');

export async function handleRecordingInProgress(ctx: ContentScriptContext): Promise<void> {
    const messageResponse = await contentScriptMessagingService.requestRecordingInProgress();
    if (isErrorResponse(messageResponse)) {
        log.error(`Failed to get recording in progress status: ${messageResponse.error}`);
        return;
    }

    if (!messageResponse.data?.inProgress) {
        return;
    }

    // TODO identify if current tab is tab that started the recording
    // const currentTabId = await getCurrentTabId();
    // if (currentTabId !== messageResponse.data.tabId) {
    //     return;
    // }

    log.info("Recording in progress, showing controls overlay...", messageResponse.data);

    openRecordingControlsOverlay(
        ctx,
        async () => {
            await closeRecordingControlsOverlay();
            log.debug('Recording controls closed');
            contentScriptMessagingService.requestStopVideoRecording();
        },
        new Date(messageResponse.data.startDate)
    );
}