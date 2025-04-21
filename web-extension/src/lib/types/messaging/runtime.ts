import { SelectionArea } from "../capture";
import { MessageBase, MessageProcessingResponse } from "./base";

/**
 * Enum defining the types for runtime messages (background <-> popup/content/etc.).
 */
export const enum RuntimeMessageType {
    FULL_SCREENSHOT = 'RUNTIME_FULL_SCREENSHOT',
    REGION_SCREENSHOT = 'RUNTIME_REGION_SCREENSHOT',
    SETUP_VIDEO_CAPTURE = 'RUNTIME_SETUP_VIDEO_CAPTURE',
    START_VIDEO_CAPTURE = 'RUNTIME_START_VIDEO_CAPTURE',
    STOP_VIDEO_CAPTURE = 'RUNTIME_STOP_VIDEO_CAPTURE',
    RECORDING_STOPPED_DATA_READY = 'RUNTIME_RECORDING_STOPPED_DATA_READY',
    IS_RECORDING_IN_PROGRESS = 'RUNTIME_IS_RECORDING_IN_PROGRESS',
    GET_RECORDING_START_DATE = 'RUNTIME_GET_RECORDING_START_DATE',
}

export const enum RuntimeMessageTarget {
    BACKGROUND = 'BACKGROUND',
    OFFSCREEN = 'OFFSCREEN',
}

interface RuntimeMessageBase<T extends RuntimeMessageType> extends MessageBase<T> {
    target: RuntimeMessageTarget;
}


// --- Specific Runtime Message Interfaces ---

export interface TakeFullScreenshotMessage extends RuntimeMessageBase<RuntimeMessageType.FULL_SCREENSHOT> { }

export interface RegionScreenshotMessage extends RuntimeMessageBase<RuntimeMessageType.REGION_SCREENSHOT> {
    region: SelectionArea;
}

export interface SetupVideoCaptureMessage extends RuntimeMessageBase<RuntimeMessageType.SETUP_VIDEO_CAPTURE> {
    tabId: number;
}

export interface StartVideoCaptureMessage extends RuntimeMessageBase<RuntimeMessageType.START_VIDEO_CAPTURE> {
}

export interface StopVideoCaptureMessage extends RuntimeMessageBase<RuntimeMessageType.STOP_VIDEO_CAPTURE> { }

export interface RecordingStoppedDataReadyMessage extends RuntimeMessageBase<RuntimeMessageType.RECORDING_STOPPED_DATA_READY> {
    videoBlobAsBase64: string;
}

export interface IsRecordingInProgressMessage extends RuntimeMessageBase<RuntimeMessageType.IS_RECORDING_IN_PROGRESS> { }

export interface GetRecordingStartDateMessage extends RuntimeMessageBase<RuntimeMessageType.GET_RECORDING_START_DATE> { }

// --- Union Type for all Runtime Messages ---

/**
 * A union type representing all possible messages sent via browser.runtime.
 */
export type RuntimeMessage =
    | TakeFullScreenshotMessage
    | RegionScreenshotMessage
    | SetupVideoCaptureMessage
    | StartVideoCaptureMessage
    | StopVideoCaptureMessage
    | RecordingStoppedDataReadyMessage
    | IsRecordingInProgressMessage
    | GetRecordingStartDateMessage;

// --- Factory Object for Creating Runtime Messages ---

/**
 * Helper functions to create runtime message objects.
 */
export const RuntimeMessages = {
    takeFullScreenshot(): TakeFullScreenshotMessage {
        return {
            target: RuntimeMessageTarget.BACKGROUND,
            type: RuntimeMessageType.FULL_SCREENSHOT
        };
    },
    takeRegionScreenshot(region: SelectionArea): RegionScreenshotMessage {
        return {
            target: RuntimeMessageTarget.BACKGROUND,
            type: RuntimeMessageType.REGION_SCREENSHOT,
            region
        };
    },
    setupVideoCapture(tabId: number): SetupVideoCaptureMessage {
        return {
            target: RuntimeMessageTarget.BACKGROUND,
            type: RuntimeMessageType.SETUP_VIDEO_CAPTURE,
            tabId,
        };
    },
    startVideoCapture(): StartVideoCaptureMessage {
        return {
            target: RuntimeMessageTarget.OFFSCREEN,
            type: RuntimeMessageType.START_VIDEO_CAPTURE,
        };
    },
    stopVideoCapture(): StopVideoCaptureMessage {
        return {
            target: RuntimeMessageTarget.OFFSCREEN,
            type: RuntimeMessageType.STOP_VIDEO_CAPTURE
        };
    },
    recordingStoppedDataReady(videoBlobAsBase64: string): RecordingStoppedDataReadyMessage {
        return {
            target: RuntimeMessageTarget.BACKGROUND,
            type: RuntimeMessageType.RECORDING_STOPPED_DATA_READY,
            videoBlobAsBase64
        };
    },
    isRecordingInProgress(): IsRecordingInProgressMessage {
        return {
            target: RuntimeMessageTarget.BACKGROUND,
            type: RuntimeMessageType.IS_RECORDING_IN_PROGRESS
        };
    },
    getRecordingStartDate(): GetRecordingStartDateMessage {
        return {
            target: RuntimeMessageTarget.OFFSCREEN,
            type: RuntimeMessageType.GET_RECORDING_START_DATE
        };
    }
};

export interface IsRecordingInProgressMessageResponse extends MessageProcessingResponse<{
    inProgress: boolean;
    recordStartDate?: string;
}> { };

export interface GetRecordingStartDateMessageResponse extends MessageProcessingResponse<{
    recordStartDate: string | null;
}> { };