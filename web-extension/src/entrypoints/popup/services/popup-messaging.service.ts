import { logger } from "$lib/utils/logger";
import * as Factories from "../../../lib/messaging/factories";
import { BaseMessagingService } from "../../../lib/messaging/handlers/base-messaging.service";
import { createErrorResponse, isErrorResponse, MessageContext, MessageResponse } from "../../../lib/messaging/types";
import { getActiveTabId } from "../../../lib/messaging/utils/tab-utils";

const log = logger.getLogger('PopupMessagingService');

export class PopupMessagingService extends BaseMessagingService<MessageContext.POPUP> {
    constructor() {
        super(MessageContext.POPUP);
    }

    async requestCaptureVisibleTab(): Promise<MessageResponse<unknown>> {
        log.debug('Requesting visible tab screenshot...');
        const response = await this.send(Factories.screenshotMessageFactory.captureVisibleTab());
        if (isErrorResponse(response)) {
            log.error(`Failed: ${response.error}`);
            // TODO: Show error to user?
        }
        return response;
    }

    async requestStartSelection(): Promise<MessageResponse<unknown>> {
        log.debug('Requesting screenshot selection start...');
        const response = await this.send(Factories.screenshotMessageFactory.startSelection());
        if (isErrorResponse(response)) {
            log.error(`Failed: ${response.error}`);
        }
        return response;
    }

    async requestSetupVideoCapture(): Promise<MessageResponse<unknown>> {
        log.debug('Requesting video capture setup...');
        const tabId = await getActiveTabId();
        if (tabId === undefined) {
            log.error('Cannot start video recording: No active tab ID found.');
            // TODO: Show error to user
            return createErrorResponse('No active tab ID found.');
        }
        const response = await this.send(Factories.videoMessageFactory.setupCaptureRequest({ tabId }));
        if (isErrorResponse(response)) {
            log.error(`Failed: ${response.error}`);
        }
        return response;
    }
}

export const popupMessagingService = new PopupMessagingService();