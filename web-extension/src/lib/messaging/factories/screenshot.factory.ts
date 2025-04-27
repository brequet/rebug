import { SelectionArea } from '../../types/capture';
import { MessageContext } from '../config/context';
import { MessageDomain } from '../config/domain';
import {
    CaptureRegionScreenshotMessage,
    CaptureVisibleTabScreenshotMessage,
    ScreenshotAction,
    StartScreenshotSelectionMessage
} from '../types/screenshot.types';

const domain = MessageDomain.SCREENSHOT;

export const screenshotMessageFactory = {
    startSelection(): StartScreenshotSelectionMessage {
        return {
            type: `${domain}:${ScreenshotAction.START_SELECTION}`,
            source: MessageContext.POPUP,
            target: MessageContext.CONTENT_SCRIPT,
            payload: undefined,
        };
    },

    captureRegion(
        payload: { region: SelectionArea }
    ): CaptureRegionScreenshotMessage {
        return {
            type: `${domain}:${ScreenshotAction.CAPTURE_REGION}`,
            source: MessageContext.CONTENT_SCRIPT,
            target: MessageContext.BACKGROUND,
            payload,
        };
    },

    captureVisibleTab(): CaptureVisibleTabScreenshotMessage {
        return {
            type: `${domain}:${ScreenshotAction.CAPTURE_VISIBLE_TAB}`,
            source: MessageContext.POPUP,
            target: MessageContext.BACKGROUND,
            payload: undefined,
        };
    },
};
