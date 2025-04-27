import * as Factories from '$lib/messaging/factories';
import { BaseMessagingService } from '$lib/messaging/handlers/base-messaging.service';
import {
    isErrorResponse,
    MessageContext,
    MessageResponse
} from '$lib/messaging/types';
import { logger } from '$lib/utils/logger';

const log = logger.getLogger('OffscreenMessagingService');

export class OffscreenMessagingService extends BaseMessagingService<MessageContext.OFFSCREEN> {
    constructor() {
        super(MessageContext.OFFSCREEN);
    }

    async notifyRecordingStoppedDataReady(videoBlobAsBase64: string): Promise<MessageResponse<unknown>> {
        log.debug('Notifying recording stopped data ready...');
        const response = await this.send(Factories.videoMessageFactory.recordingStoppedDataReady({ videoBlobAsBase64 }));
        if (isErrorResponse(response)) {
            log.error(`Failed: ${response.error}`);
        }
        return response;
    }
}

export const offscreenMessagingService = new OffscreenMessagingService();
