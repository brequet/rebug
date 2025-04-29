import { MessageContext } from '../config/context';
import {
    ResultModalType,
    ShowRecordingControlsMessage,
    ShowResultModalMessage,
    UIAction
} from '../types/ui.types';

export const uiMessageFactory = {
    showResultModal(
        resultType: ResultModalType,
        videoBlobAsBase64?: string
    ): ShowResultModalMessage {
        return {
            type: UIAction.SHOW_RESULT_MODAL,
            source: MessageContext.BACKGROUND,
            target: MessageContext.CONTENT_SCRIPT,
            payload: {
                resultType,
                videoBlobAsBase64,
            },
        };
    },

    showRecordingControls(
        startDate: Date
    ): ShowRecordingControlsMessage {
        return {
            type: UIAction.SHOW_RECORDING_CONTROLS,
            source: MessageContext.BACKGROUND,
            target: MessageContext.CONTENT_SCRIPT,
            payload: { startDate: startDate.toISOString() },
        };
    },
};
