import { MessageContext } from "$lib/messaging/types";
import { logger } from "$lib/utils/logger";

const log = logger.getLogger('ContentScript:ExternalMessageHandler');

export async function externalMessageListener(event: MessageEvent): Promise<void> {
    log.debug('Received message from web app:', event.data);

    if (event.source !== window || event.origin !== window.location.origin) {
        log.debug('Message from unknown source/origin ignored.', event.origin, event.data);
        return;
    }

    const message = event.data;
    // const message = event.data as Partial<ReceivedMessage>;

    // Validate message structure and source
    if (
        !message ||
        typeof message !== 'object' ||
        message.source !== MessageContext.WEB_APP ||
        !message.type
    ) {
        log.debug('Non-app message ignored or invalid structure.', message);
        return;
    }

    log.info('Content script received message from web app:', message);

    try {
        browser.runtime.sendMessage(message).catch((error) => {
            log.error('Error forwarding message to background:', error, message);
            // This can happen if the extension is reloaded or background is inactive
        });
    } catch (error) {
        log.error('Failed to send message to background script:', error);
        // This might indicate the extension context is invalidated (e.g., during an update)
    }
}
