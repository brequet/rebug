import { MessageContext } from "$lib/messaging/types";
import { AuthAction, LoginMessagePayload, WebAppMessage } from "$lib/messaging/types/domains/auth.types";
import { logger } from "$lib/utils/logger";
import { contentScriptMessagingService } from "../services/content-messaging.service";

const log = logger.getLogger('ContentScript:ExternalMessageHandler');

export async function externalMessageListener(event: MessageEvent): Promise<void> {
    log.debug('Received message from web app:', event.data);

    if (event.source !== window || event.origin !== window.location.origin) {
        log.debug('Message from unknown source/origin ignored.', event.origin, event.data);
        return;
    }

    const message = event.data as WebAppMessage;

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

    switch (message.type) {
        case AuthAction.LOGIN:
            await handleLoginMessage(message.payload);
            break;
        case AuthAction.LOGOUT:
            await handleLogoutMessage();
            break;
        default:
            console.warn("Unhandled message type:", message.type);
    }
}

async function handleLoginMessage(payload: LoginMessagePayload): Promise<void> {
    log.info("Received login message from web app:", payload);
    await contentScriptMessagingService.requestJwtTokenSaving(payload.token);
}

async function handleLogoutMessage(): Promise<void> {
    log.info("Received logout message from web app, clearing JWT token.");
    await contentScriptMessagingService.clearJwtToken();
}
