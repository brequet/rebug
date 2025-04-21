import { runtimeMessagingService } from "$lib/services/messaging";
import { SelectionArea } from "$lib/types/capture";
import { createSuccessResponse, MessageProcessingResponse } from "$lib/types/messaging/base";
import { ContentScriptContext, ShadowRootContentScriptUi } from "wxt/client";
import { createRecordingControlsOverlay } from "../ui/screenshotSelectionOverlay";

export async function handleStartScreenshotSelection(ctx: ContentScriptContext): Promise<MessageProcessingResponse> {
    console.log('Starting screenshot selection...');

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
        console.log('Screenshot selection area:', selectionArea);
        await runtimeMessagingService.initiateRegionScreenshot(selectionArea)
        return createSuccessResponse();
    }
    ).catch((error) => {
        console.error('Error during screenshot selection:', error);
        throw error;
    });
}
