import { SelectionArea } from "./screenshot";

interface MessageBase<T> {
    readonly type: T;
}

/**
 * Message types for browser.runtime API
 */

export const enum RuntimeMessageType {
    FULL_SCREENSHOT = 'FULL_SCREENSHOT',
    REGION_SCREENSHOT = 'REGION_SCREENSHOT',
}

interface RuntimeMessageBase<T extends RuntimeMessageType> extends MessageBase<T> { }

export type TakeFullScreenshotMessage = RuntimeMessageBase<RuntimeMessageType.FULL_SCREENSHOT>;

export interface RegionScreenshotMessage extends RuntimeMessageBase<RuntimeMessageType.REGION_SCREENSHOT> {
    region: SelectionArea;
}

export type RuntimeMessage =
    | TakeFullScreenshotMessage
    | RegionScreenshotMessage;

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
    }
};

/**
 * Message types for browser.tabs API
 */

export const enum TabMessageType {
    START_SELECTION = 'START_SELECTION',
    SHOW_RESULT_MODAL = 'SHOW_RESULT_MODAL'
}

export interface TabMessageBase<T extends TabMessageType> extends MessageBase<T> { }

export type StartSelectionMessage = TabMessageBase<TabMessageType.START_SELECTION>;

export type ShowResultModalMessage = TabMessageBase<TabMessageType.SHOW_RESULT_MODAL>;

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

export type Message =
    | RuntimeMessage
    | TabMessage;
