import { MessageContext } from '../config/context';
import { MessageDomain } from '../config/domain';
import { BaseMessage } from './base';

export enum VideoAction {
    // --- Requests ---
    SETUP_CAPTURE = 'SETUP_CAPTURE',
    START_RECORDING_REQUEST = 'START_RECORDING_REQUEST',
    STOP_RECORDING_REQUEST = 'STOP_RECORDING_REQUEST',
    GET_RECORDING_IN_PROGRESS = 'GET_RECORDING_IN_PROGRESS',

    // --- Notifications / Data Transfer ---
    RECORDING_STARTED = 'RECORDING_STARTED',
    RECORDING_STOPPED_DATA_READY = 'RECORDING_STOPPED_DATA_READY',
    RECORDING_FAILED = 'RECORDING_FAILED',
}

type VDomain = MessageDomain.VIDEO;

// --- Message Definitions ---

export type SetupVideoCaptureMessage = BaseMessage<
    `${VDomain}:${VideoAction.SETUP_CAPTURE}`,
    MessageContext.POPUP,
    MessageContext.BACKGROUND,
    { tabId: number }
>;

export type StartRecordingRequestMessage = BaseMessage<
    `${VDomain}:${VideoAction.START_RECORDING_REQUEST}`,
    MessageContext.BACKGROUND,
    MessageContext.OFFSCREEN,
    { tabId: number }
>;

export type StopRecordingRequestMessage = BaseMessage<
    `${VDomain}:${VideoAction.STOP_RECORDING_REQUEST}`,
    MessageContext.CONTENT_SCRIPT,
    MessageContext.OFFSCREEN
>;

export type GetRecordingInProgressMessage = BaseMessage<
    `${VDomain}:${VideoAction.GET_RECORDING_IN_PROGRESS}`,
    MessageContext.CONTENT_SCRIPT | MessageContext.BACKGROUND,
    MessageContext.BACKGROUND | MessageContext.OFFSCREEN
>;

export type RecordingStartedMessage = BaseMessage<
    `${VDomain}:${VideoAction.RECORDING_STARTED}`,
    MessageContext.OFFSCREEN,
    MessageContext.BACKGROUND,
    { startDate: string }
>;

export type RecordingStoppedDataReadyMessage = BaseMessage<
    `${VDomain}:${VideoAction.RECORDING_STOPPED_DATA_READY}`,
    MessageContext.OFFSCREEN,
    MessageContext.BACKGROUND,
    { videoBlobAsBase64: string }
>;

export type RecordingFailedMessage = BaseMessage<
    `${VDomain}:${VideoAction.RECORDING_FAILED}`,
    MessageContext.OFFSCREEN,
    MessageContext.BACKGROUND,
    { error: string }
>;

export type VideoMessage =
    | SetupVideoCaptureMessage
    | StartRecordingRequestMessage
    | StopRecordingRequestMessage
    | GetRecordingInProgressMessage
    | RecordingStartedMessage
    | RecordingStoppedDataReadyMessage
    | RecordingFailedMessage;


// TODO: not sure where to put this type
export type RecordingState =
    | { inProgress: boolean; startDate: string; tabId: number }
    | { inProgress: false; }