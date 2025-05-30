import { ScreenshotAction, VideoAction } from '$lib/messaging/types';
import { logger } from '$lib/utils/logger';
import { backgroundMessagingService } from '../services/background-messaging.service';
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
}
