import { AuthAction, BoardAction, ReportingAction, ScreenshotAction, VideoAction } from '$lib/messaging/types';
import { logger } from '$lib/utils/logger';
import { backgroundMessagingService } from '../services/background-messaging.service';
import { handleSaveToken, handleTokenRevocation } from './authHandler';
import { handleGetBoards } from './boardHandler';
import { handleSendReport } from './reportHandler';
import { handleCaptureRegion, handleCaptureVisibleTab } from './screenshotHandler';
import { handleRecordingInProgress, handleRecordingStoppedDataReady, handleSetupVideoCapture } from "./videoCaptureHandler";

const log = logger.getLogger('Background:MessageHandler');

export function initializeMessageListener() {
    log.info('Registering background handlers...');

    backgroundMessagingService.registerHandler(
        ScreenshotAction.CAPTURE_VISIBLE_TAB,
        handleCaptureVisibleTab
    );

    backgroundMessagingService.registerHandler(
        ScreenshotAction.CAPTURE_REGION,
        handleCaptureRegion
    );


    backgroundMessagingService.registerHandler(
        VideoAction.SETUP_CAPTURE,
        handleSetupVideoCapture
    );

    backgroundMessagingService.registerHandler(
        VideoAction.RECORDING_STOPPED_DATA_READY,
        handleRecordingStoppedDataReady
    );

    backgroundMessagingService.registerHandler(
        VideoAction.GET_RECORDING_IN_PROGRESS,
        handleRecordingInProgress
    );


    backgroundMessagingService.registerHandler(
        AuthAction.SAVE_TOKEN,
        handleSaveToken
    )

    backgroundMessagingService.registerHandler(
        AuthAction.REVOKE_TOKEN,
        handleTokenRevocation
    )


    backgroundMessagingService.registerHandler(
        BoardAction.GET_BOARDS,
        handleGetBoards
    )


    backgroundMessagingService.registerHandler(
        ReportingAction.SEND_REPORT,
        handleSendReport
    );
}
