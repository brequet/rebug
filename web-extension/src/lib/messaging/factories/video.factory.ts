import { MessageContext } from '../config/context';
import { MessageDomain } from '../config/domain';
import {
    GetRecordingInProgressMessage,
    RecordingFailedMessage,
    RecordingStartedMessage,
    RecordingStoppedDataReadyMessage,
    SetupVideoCaptureMessage,
    StartRecordingRequestMessage,
    StopRecordingRequestMessage,
    VideoAction
} from '../types/video.types';

const domain = MessageDomain.VIDEO;

export const videoMessageFactory = {
    // --- Requests ---
    setupCaptureRequest(
        payload: { tabId: number }
    ): SetupVideoCaptureMessage {
        return {
            type: `${domain}:${VideoAction.SETUP_CAPTURE}`,
            source: MessageContext.POPUP,
            target: MessageContext.BACKGROUND,
            payload,
        };
    },

    startRecordingRequest(payload: { tabId: number }): StartRecordingRequestMessage {
        return {
            type: `${domain}:${VideoAction.START_RECORDING_REQUEST}`,
            source: MessageContext.BACKGROUND,
            target: MessageContext.OFFSCREEN,
            payload,
        };
    },

    stopRecordingRequest(
        source: MessageContext.CONTENT_SCRIPT
    ): StopRecordingRequestMessage {
        return {
            type: `${domain}:${VideoAction.STOP_RECORDING_REQUEST}`,
            source,
            target: MessageContext.OFFSCREEN,
            payload: undefined,
        };
    },

    getRecordingInProgress(
        source: MessageContext.CONTENT_SCRIPT | MessageContext.BACKGROUND,
        target: MessageContext.BACKGROUND | MessageContext.OFFSCREEN
    ): GetRecordingInProgressMessage {
        return {
            type: `${domain}:${VideoAction.GET_RECORDING_IN_PROGRESS}`,
            source: source,
            target: target,
            payload: undefined,
        };
    },

    // --- Notifications / Data ---
    recordingStarted(
        payload: { startDate: string }
    ): RecordingStartedMessage {
        return {
            type: `${domain}:${VideoAction.RECORDING_STARTED}`,
            source: MessageContext.OFFSCREEN,
            target: MessageContext.BACKGROUND,
            payload,
        };
    },

    recordingStoppedDataReady(
        payload: { videoBlobAsBase64: string }
    ): RecordingStoppedDataReadyMessage {
        return {
            type: `${domain}:${VideoAction.RECORDING_STOPPED_DATA_READY}`,
            source: MessageContext.OFFSCREEN,
            target: MessageContext.BACKGROUND,
            payload,
        };
    },

    recordingFailed(
        payload: { error: string }
    ): RecordingFailedMessage {
        return {
            type: `${domain}:${VideoAction.RECORDING_FAILED}`,
            source: MessageContext.OFFSCREEN,
            target: MessageContext.BACKGROUND,
            payload,
        };
    },
};
