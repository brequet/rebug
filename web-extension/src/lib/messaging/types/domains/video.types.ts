import { MessageContext } from '../../config/context';
import { Message } from '../base';

export type RecordingState =
    | { inProgress: boolean; startDate: string; tabId: number }
    | { inProgress: false; }

export enum VideoAction {
    // --- Requests ---
    SETUP_CAPTURE = 'VIDEO:SETUP_CAPTURE',
    START_RECORDING_REQUEST = 'VIDEO:START_RECORDING_REQUEST',
    STOP_RECORDING_REQUEST = 'VIDEO:STOP_RECORDING_REQUEST',
    GET_RECORDING_IN_PROGRESS = 'VIDEO:GET_RECORDING_IN_PROGRESS',

    // --- Notifications / Data Transfer ---
    RECORDING_STOPPED_DATA_READY = 'VIDEO:RECORDING_STOPPED_DATA_READY',
}

export type SetupVideoCaptureMessage = Message<
    VideoAction.SETUP_CAPTURE,
    MessageContext.POPUP,
    MessageContext.BACKGROUND,
    { tabId: number }
>;

export type StartRecordingRequestMessage = Message<
    VideoAction.START_RECORDING_REQUEST,
    MessageContext.BACKGROUND,
    MessageContext.OFFSCREEN,
    { tabId: number }
>;

export type StopRecordingRequestMessage = Message<
    VideoAction.STOP_RECORDING_REQUEST,
    MessageContext.CONTENT_SCRIPT,
    MessageContext.OFFSCREEN
>;

export type GetRecordingInProgressMessage = Message<
    VideoAction.GET_RECORDING_IN_PROGRESS,
    MessageContext.CONTENT_SCRIPT | MessageContext.BACKGROUND,
    MessageContext.BACKGROUND | MessageContext.OFFSCREEN
>;

export type RecordingStoppedDataReadyMessage = Message<
    VideoAction.RECORDING_STOPPED_DATA_READY,
    MessageContext.OFFSCREEN,
    MessageContext.BACKGROUND,
    { videoBlobAsBase64: string }
>;

export type VideoMessage =
    | SetupVideoCaptureMessage
    | StartRecordingRequestMessage
    | StopRecordingRequestMessage
    | GetRecordingInProgressMessage
    | RecordingStoppedDataReadyMessage;
