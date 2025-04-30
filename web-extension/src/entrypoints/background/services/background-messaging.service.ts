import * as Factories from '$lib/messaging/factories';
import { BaseMessagingService } from '$lib/messaging/handlers/base-messaging.service';
import {
    isErrorResponse,
    MessageContext,
    MessageResponse,
    RecordingState,
    ShowResultModalMessagePayload
} from '$lib/messaging/types';
import { logger } from '$lib/utils/logger';

const log = logger.getLogger('BackgroundMessagingService');

export class BackgroundMessagingService extends BaseMessagingService<MessageContext.BACKGROUND> {
    constructor() {
        super(MessageContext.BACKGROUND);
    }

    async notifyContentToShowResult(
        resultModalMessagePayload: ShowResultModalMessagePayload
    ): Promise<MessageResponse<unknown>> {
        log.debug(`Notifying content script to show result modal: ${resultModalMessagePayload.resultType}`);
        const response = await this.send(
            Factories.uiMessageFactory.showResultModal(resultModalMessagePayload)
        );
        if (isErrorResponse(response)) {
            log.error(`Failed to notify content script to show result modal: ${response.error}`);
        }
        return response;
    }

    async requestRecordingStart(tabId: number): Promise<MessageResponse<unknown>> {
        log.debug('Requesting video capture start...');
        const response = await this.send(
            Factories.videoMessageFactory.startRecordingRequest({ tabId })
        );
        if (isErrorResponse(response)) {
            log.error(`Failed to start video capture: ${response.error}`);
        }
        return response;
    }

    async requestShowRecordingControls(startDate: Date): Promise<MessageResponse<unknown>> {
        log.debug('Requesting to show recording controls...');
        const response = await this.send(
            Factories.uiMessageFactory.showRecordingControls(startDate)
        );
        if (isErrorResponse(response)) {
            log.error(`Failed to show recording controls: ${response.error}`);
        }
        return response
    }

    async requestRecordingInProgress(): Promise<MessageResponse<RecordingState>> {
        log.debug('Requesting recording in progress status...');
        const response = await this.send<RecordingState>(Factories.videoMessageFactory.getRecordingInProgress(this.context, MessageContext.OFFSCREEN));
        if (isErrorResponse(response)) {
            log.error(`Failed: ${response.error}`);
        }
        return response;
    }
}

export const backgroundMessagingService = new BackgroundMessagingService();
