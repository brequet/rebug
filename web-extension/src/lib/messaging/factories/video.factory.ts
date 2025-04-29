import { MessageContext } from '../config/context';
import {
    GetRecordingInProgressMessage,
    RecordingStoppedDataReadyMessage,
    SetupVideoCaptureMessage,
    StartRecordingRequestMessage,
    StopRecordingRequestMessage,
    VideoAction
} from '../types/domains/video.types';

export const videoMessageFactory = {
    // --- Requests ---
    setupCaptureRequest(
        payload: { tabId: number }
    ): SetupVideoCaptureMessage {
        return {
            type: VideoAction.SETUP_CAPTURE,
            source: MessageContext.POPUP,
            target: MessageContext.BACKGROUND,
            payload,
        };
    },

    startRecordingRequest(payload: { tabId: number }): StartRecordingRequestMessage {
        return {
            type: VideoAction.START_RECORDING_REQUEST,
            source: MessageContext.BACKGROUND,
            target: MessageContext.OFFSCREEN,
            payload,
        };
    },

    stopRecordingRequest(
        source: MessageContext.CONTENT_SCRIPT
    ): StopRecordingRequestMessage {
        return {
            type: VideoAction.STOP_RECORDING_REQUEST,
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
            type: VideoAction.GET_RECORDING_IN_PROGRESS,
            source: source,
            target: target,
            payload: undefined,
        };
    },

    // --- Notifications / Data ---
    recordingStoppedDataReady(
        payload: { videoBlobAsBase64: string }
    ): RecordingStoppedDataReadyMessage {
        return {
            type: VideoAction.RECORDING_STOPPED_DATA_READY,
            source: MessageContext.OFFSCREEN,
            target: MessageContext.BACKGROUND,
            payload,
        };
    },
};
