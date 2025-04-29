import { SelectionArea } from '../../types/capture';
import { MessageContext } from '../config/context';
import { MessageDomain } from '../config/domain';
import { BaseMessage } from './base';

export enum ScreenshotAction {
    START_SELECTION = 'START_SELECTION',
    CAPTURE_REGION = 'CAPTURE_REGION',
    CAPTURE_VISIBLE_TAB = 'CAPTURE_VISIBLE_TAB',
}

type SDomain = MessageDomain.SCREENSHOT;

// --- Message Definitions ---

export type StartScreenshotSelectionMessage = BaseMessage<
    `${SDomain}:${ScreenshotAction.START_SELECTION}`,
    MessageContext.POPUP,
    MessageContext.CONTENT_SCRIPT
>;

export type CaptureRegionScreenshotMessage = BaseMessage<
    `${SDomain}:${ScreenshotAction.CAPTURE_REGION}`,
    MessageContext.CONTENT_SCRIPT,
    MessageContext.BACKGROUND,
    { region: SelectionArea }
>;

export type CaptureVisibleTabScreenshotMessage = BaseMessage<
    `${SDomain}:${ScreenshotAction.CAPTURE_VISIBLE_TAB}`,
    MessageContext.POPUP,
    MessageContext.BACKGROUND
>;

export type ScreenshotMessage =
    | StartScreenshotSelectionMessage
    | CaptureRegionScreenshotMessage
    | CaptureVisibleTabScreenshotMessage;
