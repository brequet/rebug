import * as Factories from "$lib/messaging/factories";
import { BaseMessagingService } from "$lib/messaging/handlers/base-messaging.service";
import { isErrorResponse, MessageContext, MessageResponse, RecordingState, SelectionArea } from "$lib/messaging/types";
import { logger } from "$lib/utils/logger";

const log = logger.getLogger('ContentScriptMessagingService');

export class ContentScriptMessagingService extends BaseMessagingService<MessageContext.CONTENT_SCRIPT> {
    constructor() {
        super(MessageContext.CONTENT_SCRIPT);
    }

    async requestRegionScreenshot(region: SelectionArea): Promise<MessageResponse<unknown>> {
        log.debug('Requesting region screenshot...');
        const response = await this.send(Factories.screenshotMessageFactory.captureRegion({ region }));
        if (isErrorResponse(response)) {
            log.error(`Failed: ${response.error}`);
        }
        return response;
    }

    async requestStopVideoRecording(): Promise<MessageResponse<unknown>> {
        log.debug('Requesting video recording stop...');
        const response = await this.send(Factories.videoMessageFactory.stopRecordingRequest(this.context));
        if (isErrorResponse(response)) {
            log.error(`Failed: ${response.error}`);
        }
        return response
    }

    async requestRecordingInProgress(): Promise<MessageResponse<RecordingState>> {
        log.debug('Requesting recording in progress status...');
        const response = await this.send<RecordingState>(Factories.videoMessageFactory.getRecordingInProgress(this.context, MessageContext.BACKGROUND));
        if (isErrorResponse(response)) {
            log.error(`Failed: ${response.error}`);
        }
        return response;
    }
}

export const contentScriptMessagingService = new ContentScriptMessagingService();