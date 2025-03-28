/**
 * Message types for browser.runtime API
 */
export const enum RuntimeMessageType {
    FULL_SCREENSHOT = 'FULL_SCREENSHOT',
    SHOW_RESULT_MODAL = 'SHOW_RESULT_MODAL',
}

interface RuntimeMessageBase<T extends RuntimeMessageType> {
    readonly type: T;
}

export interface TakeFullScreenshotMessage extends RuntimeMessageBase<
    RuntimeMessageType.FULL_SCREENSHOT
> { }

export type RuntimeMessage =
    | TakeFullScreenshotMessage;

export const RuntimeMessages = {
    takeFullScreenshot(): TakeFullScreenshotMessage {
        return {
            type: RuntimeMessageType.FULL_SCREENSHOT
        };
    },
};

/**
 * Message types for browser.tabs API
 */
export const enum TabMessageType {
    START_SELECTION = 'START_SELECTION',
    SHOW_RESULT_MODAL = 'SHOW_RESULT_MODAL'
}

export interface TabMessageBase<T extends TabMessageType> {
    readonly type: T;
}

export interface StartSelectionMessage extends TabMessageBase<TabMessageType.START_SELECTION> { }

export interface ShowResultModalMessage extends TabMessageBase<
    TabMessageType.SHOW_RESULT_MODAL
> { }

export type TabMessage =
    | StartSelectionMessage
    | ShowResultModalMessage;

export const TabMessages = {
    startSelection(): StartSelectionMessage {
        return {
            type: TabMessageType.START_SELECTION,
        };
    },
    showResultModal(): ShowResultModalMessage {
        return {
            type: TabMessageType.SHOW_RESULT_MODAL,
        };
    }
};

// export interface CaptureRegionMessage {
// 	action: MessageType.CaptureRegion;
// 	region: {
// 		left: number;
// 		top: number;
// 		width: number;
// 		height: number;
// 	};
// }

// export interface SaveScreenshotMessage {
// 	action: MessageType.SaveScreenshot;
// 	dataUrl: string;
// }

export type Message =
    | RuntimeMessage
    | TabMessage;
