import { ScreenshotAction, ShowRecordingControlsMessage, StartScreenshotSelectionMessage, UIAction } from "$lib/messaging/types";
import { logger } from "$lib/utils/logger";
import { ContentScriptContext } from "wxt/client";
import { contentScriptMessagingService } from "../services/content-messaging.service";
import { handleStartScreenshotSelection } from "./screenshotHandler";
import { handleShowRecordingControlsOverlay, handleShowResultModal } from "./uiHandler";

const log = logger.getLogger('ContentScript:MessageHandler');

export function initializeMessageListener(ctx: ContentScriptContext) {
    log.info('Registering content script handlers...');

    contentScriptMessagingService.registerHandler(
        UIAction.SHOW_RESULT_MODAL,
        handleShowResultModal
    )

    contentScriptMessagingService.registerHandler(
        ScreenshotAction.START_SELECTION,
        (message: StartScreenshotSelectionMessage) => handleStartScreenshotSelection(message, ctx)
    )

    contentScriptMessagingService.registerHandler(
        UIAction.SHOW_RECORDING_CONTROLS,
        (message: ShowRecordingControlsMessage) => handleShowRecordingControlsOverlay(message, ctx)
    )
}
