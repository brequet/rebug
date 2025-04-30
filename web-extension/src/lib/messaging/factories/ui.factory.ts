import { MessageContext } from '../config/context';
import {
    ShowRecordingControlsMessage,
    ShowResultModalMessage,
    ShowResultModalMessagePayload,
    UIAction
} from '../types/domains/ui.types';

export const uiMessageFactory = {
    showResultModal(
        payload: ShowResultModalMessagePayload
    ): ShowResultModalMessage {
        return {
            type: UIAction.SHOW_RESULT_MODAL,
            source: MessageContext.BACKGROUND,
            target: MessageContext.CONTENT_SCRIPT,
            payload
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
