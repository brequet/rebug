import { VideoAction } from '$lib/messaging/types';
import { logger } from '$lib/utils/logger';
import { offscreenMessagingService } from '../services/offscreen-messaging.service';
import { handleRecordingInProgress, handleStartRecording, handleStopRecording } from './videoCaptureHandler';

const log = logger.getLogger('Offscreen:MessageHandler');

export function initializeMessageListener() {
    log.info('Registering offscreen script handlers...');

    offscreenMessagingService.registerHandler(
        VideoAction.START_RECORDING_REQUEST,
        handleStartRecording
    )

    offscreenMessagingService.registerHandler(
        VideoAction.STOP_RECORDING_REQUEST,
        handleStopRecording
    )

    offscreenMessagingService.registerHandler(
        VideoAction.GET_RECORDING_IN_PROGRESS,
        handleRecordingInProgress
    );
}
