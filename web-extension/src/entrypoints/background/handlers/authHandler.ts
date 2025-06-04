import { AuthUtils } from "$lib/auth/auth.utils";
import { createErrorResponse, createSuccessResponse, MessageResponse, RevokeTokenMessage, SaveTokenMessage } from "$lib/messaging/types";
import { logger } from "$lib/utils/logger";

const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';

const log = logger.getLogger('Background:AuthHandler');

export async function handleSaveToken(message: SaveTokenMessage): Promise<MessageResponse<void>> {
    log.info(`Handling ${message.type}`, message.payload);

    const { token } = message.payload;
    if (!token || typeof token !== 'string') {
        return createErrorResponse('Invalid token provided');
    }

    try {
        await AuthUtils.saveToken(token);
        log.info('Token saved successfully');
        return createSuccessResponse();
    } catch (error) {
        log.error('Error saving token', error);
        return createErrorResponse((error as Error).message || 'Failed to save token');
    }
}

export async function handleTokenRevocation(message: RevokeTokenMessage): Promise<MessageResponse<void>> {
    log.info(`Handling ${message.type}`, message.payload);

    try {
        await AuthUtils.revokeToken();
        log.info('Token revoked successfully');
        return createSuccessResponse();
    } catch (error) {
        log.error('Error revoking token', error);
        return createErrorResponse((error as Error).message || 'Failed to revoke token');
    }
}
