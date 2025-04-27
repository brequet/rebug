import { MessageContext } from '../config/context';
import { MessageDomain } from '../config/domain';
import {
    CloseRecordingControlsMessage,
    ResultModalType,
    ShowRecordingControlsMessage,
    ShowResultModalMessage,
    UIAction,
} from '../types/ui.types';

const domain = MessageDomain.UI;

export const uiMessageFactory = {
    showResultModal(
        resultType: ResultModalType,
        videoBlobAsBase64?: string
    ): ShowResultModalMessage {
        return {
            type: `${domain}:${UIAction.SHOW_RESULT_MODAL}`,
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
            type: `${domain}:${UIAction.SHOW_RECORDING_CONTROLS}`,
            source: MessageContext.BACKGROUND,
            target: MessageContext.CONTENT_SCRIPT,
            payload: { startDate: startDate.toISOString() },
        };
    },

    closeRecordingControls(
    ): CloseRecordingControlsMessage {
        return {
            type: `${domain}:${UIAction.CLOSE_RECORDING_CONTROLS}`,
            source: MessageContext.BACKGROUND,
            target: MessageContext.CONTENT_SCRIPT,
            payload: undefined,
        };
    },
};
