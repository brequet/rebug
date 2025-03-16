export enum MessageType {
	TakeFullScreenshot = 'takeFullScreenshot',
	StartSelection = 'startSelection',
	CaptureRegion = 'captureRegion',
	SaveScreenshot = 'saveScreenshot',
	ShowScreenshotModal = 'showScreenshotModal'
}

export interface TakeFullScreenshotMessage {
	action: MessageType.TakeFullScreenshot;
}

export interface StartSelectionMessage {
	action: MessageType.StartSelection;
}

export interface CaptureRegionMessage {
	action: MessageType.CaptureRegion;
	region: {
		left: number;
		top: number;
		width: number;
		height: number;
	};
}

export interface SaveScreenshotMessage {
	action: MessageType.SaveScreenshot;
	dataUrl: string;
}

export interface ShowScreenshotModalMessage {
	action: MessageType.ShowScreenshotModal;
	dataUrl: string;
}

export type Message =
	| TakeFullScreenshotMessage
	| StartSelectionMessage
	| CaptureRegionMessage
	| SaveScreenshotMessage
	| ShowScreenshotModalMessage;
