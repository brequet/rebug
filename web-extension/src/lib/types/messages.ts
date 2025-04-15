import { SelectionArea } from "./capture";

interface MessageBase<T> {
    readonly type: T;
}

/**
 * Message types for browser.runtime API
 */

export const enum RuntimeMessageType {
    FULL_SCREENSHOT = 'FULL_SCREENSHOT',
    REGION_SCREENSHOT = 'REGION_SCREENSHOT',
    START_VIDEO_CAPTURE = 'START_TAB_CAPTURE',
    STOP_VIDEO_CAPTURE = 'STOP_TAB_CAPTURE'
}

interface RuntimeMessageBase<T extends RuntimeMessageType> extends MessageBase<T> { }

export type TakeFullScreenshotMessage = RuntimeMessageBase<RuntimeMessageType.FULL_SCREENSHOT>;

export interface RegionScreenshotMessage extends RuntimeMessageBase<RuntimeMessageType.REGION_SCREENSHOT> {
    region: SelectionArea;
}

export type StartVideoCaptureMessage = RuntimeMessageBase<RuntimeMessageType.START_VIDEO_CAPTURE>;

export type StopVideoCaptureMessage = RuntimeMessageBase<RuntimeMessageType.STOP_VIDEO_CAPTURE>;

export type RuntimeMessage =
    | TakeFullScreenshotMessage
    | RegionScreenshotMessage
    | StartVideoCaptureMessage
    | StopVideoCaptureMessage;

export const RuntimeMessages = {
    takeFullScreenshot(): TakeFullScreenshotMessage {
        return {
            type: RuntimeMessageType.FULL_SCREENSHOT
        };
    },
    takeRegionScreenshot(region: SelectionArea): RegionScreenshotMessage {
        return {
            type: RuntimeMessageType.REGION_SCREENSHOT,
            region
        };
    },
    startVideoCapture(): StartVideoCaptureMessage {
        return {
            type: RuntimeMessageType.START_VIDEO_CAPTURE,
        };
    },
    stopVideoCapture(): StopVideoCaptureMessage {
        return {
            type: RuntimeMessageType.STOP_VIDEO_CAPTURE
        };
    }
};

/**
 * Message types for browser.tabs API
 */

export const enum TabMessageType {
    START_SELECTION = 'START_SELECTION',
    SHOW_RESULT_MODAL = 'SHOW_RESULT_MODAL',
    STREAM_ID_RECEIVED = 'STREAM_ID_RECEIVED',
    SHOW_RECORDING_CONTROLS = 'SHOW_RECORDING_CONTROLS',
}

export interface TabMessageBase<T extends TabMessageType> extends MessageBase<T> { }

export type StartSelectionMessage = TabMessageBase<TabMessageType.START_SELECTION>;

export const enum ResultModalType {
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
}

export interface ShowResultModalMessage extends TabMessageBase<TabMessageType.SHOW_RESULT_MODAL> {
    resultModalType: ResultModalType;
}

export interface StreamIdReceivedMessage extends TabMessageBase<TabMessageType.STREAM_ID_RECEIVED> {
    streamId: string;
}

export type TabMessage =
    | StartSelectionMessage
    | ShowResultModalMessage
    | StreamIdReceivedMessage;

export const TabMessages = {
    startSelection(): StartSelectionMessage {
        return {
            type: TabMessageType.START_SELECTION,
        };
    },
    showResultModal(resultModalType: ResultModalType): ShowResultModalMessage {
        return {
            type: TabMessageType.SHOW_RESULT_MODAL,
            resultModalType
        };
    },
    streamIdReceived(streamId: string): StreamIdReceivedMessage {
        return {
            type: TabMessageType.STREAM_ID_RECEIVED,
            streamId
        };
    },
};

export type Message =
    | RuntimeMessage
    | TabMessage;

export interface MessageProcessingResponse {
    success: boolean;
    error?: string;
    data?: unknown;
}

export function createMessageProcessingResponse(success: boolean, error?: string, data?: unknown): MessageProcessingResponse {
    if (error) {
        console.error('Error:', error);
    }
    return { success, error, data };
}