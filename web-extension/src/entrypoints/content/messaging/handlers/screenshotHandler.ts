import { createErrorResponse, createSuccessResponse, MessageResponse, StartScreenshotSelectionMessage } from "$lib/messaging/types";
import { SelectionArea } from "$lib/types/capture";
import { logger } from "$lib/utils/logger";
import { ContentScriptContext, ShadowRootContentScriptUi } from "wxt/client";
import { createRecordingControlsOverlay } from "../../ui/screenshotSelectionOverlay";
import { contentScriptMessagingService } from "../services/content-messaging.service";

const log = logger.getLogger('ContentScript:ScreenshotHandler');

export async function handleStartScreenshotSelection(message: StartScreenshotSelectionMessage, ctx: ContentScriptContext): Promise<MessageResponse<unknown>> {
    log.info(`Handling ${message.type}`);

    return new Promise<SelectionArea>((resolve, reject) => {
        let ui: ShadowRootContentScriptUi<void>;

        const onComplete = (selectionArea: SelectionArea) => {
            ui.remove();
            resolve(selectionArea);
        };

        const onCancel = () => {
            ui.remove();
            reject(new Error('Screenshot selection cancelled'));
        };

        createRecordingControlsOverlay(ctx, onComplete, onCancel).then(createdUi => {
            ui = createdUi;
            ui.mount();
        });
    }).then(async (selectionArea) => {
        await contentScriptMessagingService.requestRegionScreenshot(selectionArea);
        return createSuccessResponse();
    }
    ).catch((error) => {
        log.error('Error during screenshot selection:', error);
        return createErrorResponse(error.message || 'Unknown error during screenshot selection');
    });
}
