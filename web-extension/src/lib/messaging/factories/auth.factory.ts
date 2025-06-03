import { MessageContext } from '../config/context';
import { AuthAction, RevokeTokenMessage, SaveTokenMessage } from '../types/domains/auth.types';

export const authMessageFactory = {
    saveToken(token: string): SaveTokenMessage {
        return {
            type: AuthAction.SAVE_TOKEN,
            source: MessageContext.CONTENT_SCRIPT,
            target: MessageContext.BACKGROUND,
            payload: { token },
        };
    },

    revokeToken(): RevokeTokenMessage {
        return {
            type: AuthAction.REVOKE_TOKEN,
            source: MessageContext.CONTENT_SCRIPT,
            target: MessageContext.BACKGROUND,
            payload: undefined,
        };
    }
};
