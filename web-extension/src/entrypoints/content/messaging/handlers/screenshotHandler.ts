import { createErrorResponse, createSuccessResponse, MessageResponse, StartScreenshotSelectionMessage } from "$lib/messaging/types";
import { SelectionArea } from "$lib/types/capture";
import { logger } from "$lib/utils/logger";
import { ContentScriptContext, ShadowRootContentScriptUi } from "wxt/client";
import { createRecordingControlsOverlay } from "../../ui/screenshotSelectionOverlay";
import { contentScriptMessagingService } from "../services/content-messaging.service";

const log = logger.getLogger('ContentScript:ScreenshotHandler');

export async function handleStartScreenshotSelection(message: StartScreenshotSelectionMessage, ctx: ContentScriptContext): Promise<MessageResponse<unknown>> {
    log.info(`Handling ${message.type}`);

    try {
        let ui: ShadowRootContentScriptUi<void>;

        const onComplete = async (selectionArea: SelectionArea) => {
            ui.remove();
            try {
                await contentScriptMessagingService.requestRegionScreenshot(selectionArea);
            } catch (error) {
                log.error('Error requesting region screenshot:', error);
            }
        };

        const onCancel = () => {
            ui.remove();
            log.info('Screenshot selection cancelled by user');
        };

        ui = await createRecordingControlsOverlay(ctx, onComplete, onCancel);

        ui.mount();
        return createSuccessResponse();
    } catch (error) {
        log.error('Error starting screenshot selection:', error);
        return createErrorResponse((error as Error).message || 'Failed to start screenshot selection');
    }
}

