import { getActiveTabId } from '$lib/messaging/utils/tab-utils';
import { logger } from '$lib/utils/logger';
import { AppMessage, MessageContext, MessageResponse, createErrorResponse, isSuccessResponse } from '../types';

const log = logger.getLogger('MessageBus');

export class MessageBus {
    /**
     * Sends a message using the appropriate browser API based on the target context.
     * Automatically determines the target tab ID for content script messages.
     */
    async send<TResponseData = unknown>(
        message: AppMessage
    ): Promise<MessageResponse<TResponseData>> {
        log.debug(`Sending ${message.type} from ${message.source} to ${message.target}`, message.payload);

        try {
            let response: any;
            switch (message.target) {
                case MessageContext.BACKGROUND:
                case MessageContext.OFFSCREEN:
                    response = await browser.runtime.sendMessage(message);
                    break;

                case MessageContext.CONTENT_SCRIPT:
                    const tabId = await getActiveTabId();
                    if (tabId === undefined) {
                        throw new Error('Cannot send message to content script: No active tab found.');
                    }
                    log.debug(`Targeting tab ID: ${tabId} for content script message`);
                    response = await browser.tabs.sendMessage(tabId, message);
                    break;


                default:
                    throw new Error(`Unsupported message target context: ${(message as AppMessage).target}`);
            }

            // Basic validation of the response structure
            if (typeof response?.success !== 'boolean') {
                log.warn(`Received malformed response for ${message.type}:`, response);
                throw new Error(`Received malformed response from ${message.target}`);
            }

            if (isSuccessResponse(response)) {
                log.debug(`Success response for ${message.type} from ${message.target}`, response.data);
            } else {
                log.warn(`Error response for ${message.type} from ${message.target}: ${response.error}`);
            }

            return response as MessageResponse<TResponseData>;

        } catch (error: any) {
            log.error(`Error sending message ${message.type} to ${message.target}:`, error);
            return createErrorResponse(
                error?.message || `Failed to send message to ${message.target}`
            );
        }
    }
}

export const messageBus = new MessageBus();


