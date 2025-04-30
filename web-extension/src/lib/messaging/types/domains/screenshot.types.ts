import { MessageContext } from '../../config/context';
import { Message } from '../base';

export const SCREENSHOT_FORMAT = 'png';
export const SCREENSHOT_MIME_TYPE = 'image/png';

export interface SelectionArea {
    x: number;
    y: number;
    width: number;
    height: number;
    devicePixelRatio: number;
}

export enum ScreenshotAction {
    START_SELECTION = 'SCREENSHOT:START_SELECTION',
    CAPTURE_REGION = 'SCREENSHOT:CAPTURE_REGION',
    CAPTURE_VISIBLE_TAB = 'SCREENSHOT:CAPTURE_VISIBLE_TAB'
}

export type StartScreenshotSelectionMessage = Message<
    ScreenshotAction.START_SELECTION,
    MessageContext.POPUP,
    MessageContext.CONTENT_SCRIPT
>;

export type CaptureRegionScreenshotMessage = Message<
    ScreenshotAction.CAPTURE_REGION,
    MessageContext.CONTENT_SCRIPT,
    MessageContext.BACKGROUND,
    { region: SelectionArea }
>;

export type CaptureVisibleTabScreenshotMessage = Message<
    ScreenshotAction.CAPTURE_VISIBLE_TAB,
    MessageContext.POPUP,
    MessageContext.BACKGROUND
>;

export type ScreenshotMessage =
    | StartScreenshotSelectionMessage
    | CaptureRegionScreenshotMessage
    | CaptureVisibleTabScreenshotMessage;
