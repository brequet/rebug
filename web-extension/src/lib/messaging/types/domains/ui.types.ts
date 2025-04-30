import { MessageContext } from '../../config/context';
import { Message } from '../base';

export enum ResultModalType {
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
}

export enum UIAction {
    SHOW_RESULT_MODAL = 'UI:SHOW_RESULT_MODAL',
    SHOW_RECORDING_CONTROLS = 'UI:SHOW_RECORDING_CONTROLS',
    SHOW_SCREENSHOT_SELECTION_UI = 'UI:SHOW_SCREENSHOT_SELECTION_UI',
}

export type ShowResultModalMessagePayload =
    | { resultType: ResultModalType.IMAGE; base64Image: string; }
    | { resultType: ResultModalType.VIDEO; base64Video: string; };

export type ShowResultModalMessage = Message<
    UIAction.SHOW_RESULT_MODAL,
    MessageContext.BACKGROUND,
    MessageContext.CONTENT_SCRIPT,
    ShowResultModalMessagePayload
>;

export type ShowRecordingControlsMessage = Message<
    UIAction.SHOW_RECORDING_CONTROLS,
    MessageContext.BACKGROUND,
    MessageContext.CONTENT_SCRIPT,
    { startDate: string }
>;

export type UIMessage =
    | ShowResultModalMessage
    | ShowRecordingControlsMessage;
