import { MessageDomain, ScreenshotAction, VideoAction } from '$lib/messaging/types';
import { logger } from '$lib/utils/logger';
import { backgroundMessagingService } from '../services/background-messaging.service';
import { handleCaptureRegion, handleCaptureVisibleTab } from './screenshotHandler';
import { handleRecordingInProgress, handleRecordingStoppedDataReady, handleSetupVideoCapture } from "./videoCaptureHandler";

const log = logger.getLogger('Background:MessageHandler');

export function initializeMessageListener() {
    log.info('Registering background handlers...');

    backgroundMessagingService.registerHandler(
        `${MessageDomain.SCREENSHOT}:${ScreenshotAction.CAPTURE_VISIBLE_TAB}`,
        handleCaptureVisibleTab
    );

    backgroundMessagingService.registerHandler(
        `${MessageDomain.SCREENSHOT}:${ScreenshotAction.CAPTURE_REGION}`,
        handleCaptureRegion
    );


    backgroundMessagingService.registerHandler(
        `${MessageDomain.VIDEO}:${VideoAction.SETUP_CAPTURE}`,
        handleSetupVideoCapture
    );

    backgroundMessagingService.registerHandler(
        `${MessageDomain.VIDEO}:${VideoAction.RECORDING_STOPPED_DATA_READY}`,
        handleRecordingStoppedDataReady
    );

    backgroundMessagingService.registerHandler(
        `${MessageDomain.VIDEO}:${VideoAction.GET_RECORDING_IN_PROGRESS}`,
        handleRecordingInProgress
    );
}



// async function handleMessage(message: RuntimeMessage): Promise<MessageProcessingResponse> {
//     switch (message.type) {
//         case RuntimeMessageType.SETUP_VIDEO_CAPTURE:
//             return handleSetupVideoCapture(message.tabId);
//         case RuntimeMessageType.RECORDING_STOPPED_DATA_READY:
//             return handleRecordingStoppedDataReady(message);
//         case RuntimeMessageType.IS_RECORDING_IN_PROGRESS:
//             return isRecordingInProgress();
//         default:
//             return createErrorResponse(`Unknown message type: ${(message as any).type}`);
//     }
// }