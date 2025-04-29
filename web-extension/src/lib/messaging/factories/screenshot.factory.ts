import { SelectionArea } from '../../types/capture';
import { MessageContext } from '../config/context';
import { CaptureRegionScreenshotMessage, CaptureVisibleTabScreenshotMessage, ScreenshotAction, StartScreenshotSelectionMessage } from '../types';

export const screenshotMessageFactory = {
    startSelection(): StartScreenshotSelectionMessage {
        return {
            type: ScreenshotAction.START_SELECTION,
            source: MessageContext.POPUP,
            target: MessageContext.CONTENT_SCRIPT,
            payload: undefined,
        };
    },

    captureRegion(
        payload: { region: SelectionArea }
    ): CaptureRegionScreenshotMessage {
        return {
            type: ScreenshotAction.CAPTURE_REGION,
            source: MessageContext.CONTENT_SCRIPT,
            target: MessageContext.BACKGROUND,
            payload,
        };
    },

    captureVisibleTab(): CaptureVisibleTabScreenshotMessage {
        return {
            type: ScreenshotAction.CAPTURE_VISIBLE_TAB,
            source: MessageContext.POPUP,
            target: MessageContext.BACKGROUND,
            payload: undefined,
        };
    },
};
