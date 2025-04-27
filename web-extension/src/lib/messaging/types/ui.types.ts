import { MessageContext } from '../config/context';
import { MessageDomain } from '../config/domain';
import { BaseMessage } from './base';

export enum ResultModalType {
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
}

export enum UIAction {
    SHOW_RESULT_MODAL = 'SHOW_RESULT_MODAL',
    SHOW_RECORDING_CONTROLS = 'SHOW_RECORDING_CONTROLS',
    CLOSE_RECORDING_CONTROLS = 'CLOSE_RECORDING_CONTROLS',
    SHOW_SCREENSHOT_SELECTION_UI = 'SHOW_SCREENSHOT_SELECTION_UI',
}

type UIDomain = MessageDomain.UI;

// --- Message Definitions ---

export type ShowResultModalMessage = BaseMessage<
    `${UIDomain}:${UIAction.SHOW_RESULT_MODAL}`,
    MessageContext.BACKGROUND,
    MessageContext.CONTENT_SCRIPT,
    {
        resultType: ResultModalType;
        videoBlobAsBase64?: string;
    }
>;

export type ShowRecordingControlsMessage = BaseMessage<
    `${UIDomain}:${UIAction.SHOW_RECORDING_CONTROLS}`,
    MessageContext.BACKGROUND,
    MessageContext.CONTENT_SCRIPT,
    { startDate: string }
>;

export type CloseRecordingControlsMessage = BaseMessage<
    `${UIDomain}:${UIAction.CLOSE_RECORDING_CONTROLS}`,
    MessageContext.BACKGROUND,
    MessageContext.CONTENT_SCRIPT
>;

export type UIMessage =
    | ShowResultModalMessage
    | ShowRecordingControlsMessage
    | CloseRecordingControlsMessage;

