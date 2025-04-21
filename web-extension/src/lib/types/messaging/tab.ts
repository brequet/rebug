import { MessageBase } from "./base";

/**
 * Enum defining the types for tab messages (background -> content script..).
 */
export const enum TabMessageType {
    START_SELECTION = 'TAB_START_SELECTION',
    SHOW_RESULT_MODAL = 'TAB_SHOW_RESULT_MODAL',
    SHOW_RECORDING_CONTROLS = 'TAB_SHOW_RECORDING_CONTROLS',
}

export interface TabMessageBase<T extends TabMessageType> extends MessageBase<T> { }

// --- Specific Tab Message Interfaces ---

export interface StartSelectionMessage extends TabMessageBase<TabMessageType.START_SELECTION> { }

// TODO: another type file for this enum
export const enum ResultModalType {
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
}

export interface ShowResultModalMessage extends TabMessageBase<TabMessageType.SHOW_RESULT_MODAL> {
    resultModalType: ResultModalType;
    videoBlobAsBase64?: string;
}

export interface ShowRecordingControlsMessage extends TabMessageBase<TabMessageType.SHOW_RECORDING_CONTROLS> {
    startDate: Date;
}

// --- Union Type for all Tab Messages ---

/**
 * A union type representing all possible messages sent via browser.tabs.
 */
export type TabMessage =
    | StartSelectionMessage
    | ShowResultModalMessage
    | ShowRecordingControlsMessage;

// --- Factory Object for Creating Tab Messages ---

/**
 * Helper functions to create tab message objects.
 */
export const TabMessages = {
    startSelection(): StartSelectionMessage {
        return {
            type: TabMessageType.START_SELECTION,
        };
    },
    showResultModal(resultModalType: ResultModalType, videoBlobAsBase64?: string): ShowResultModalMessage {
        return {
            type: TabMessageType.SHOW_RESULT_MODAL,
            resultModalType,
            videoBlobAsBase64
        };
    },
    showRecordingControls(startDate: Date): ShowRecordingControlsMessage {
        return {
            type: TabMessageType.SHOW_RECORDING_CONTROLS,
            startDate
        };
    }
};
