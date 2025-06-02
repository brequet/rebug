import { ScreenshotAction, ShowRecordingControlsMessage, StartScreenshotSelectionMessage, UIAction } from "$lib/messaging/types";
import { logger } from "$lib/utils/logger";
import { ContentScriptContext } from "wxt/client";
import { contentScriptMessagingService } from "../services/content-messaging.service";
import { externalMessageListener } from "./externalMessageHandler";
import { handleStartScreenshotSelection } from "./screenshotHandler";
import { handleShowRecordingControlsOverlay, handleShowResultModal } from "./uiHandler";

const log = logger.getLogger('ContentScript:MessageHandler');

export function initializeMessageListener(ctx: ContentScriptContext): void {
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

export function initializeExternalMessageListener(): void {
    log.info('Initializing external message listener...');

    if (typeof window !== 'undefined') {
        window.addEventListener('message', externalMessageListener, false);
        log.info('Content script listening for messages from web app.');
    } else {
        log.error('Window object is not available. Content script cannot set ready flag or listen for messages.');
    }
}
