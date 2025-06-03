import { WEB_APP_MESSAGE_SOURCE } from './extension-messaging.config';

export enum WebAppMessageType {
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
}

export interface BaseMessage<
    TType extends WebAppMessageType,
    TPayload = void,
> {
    readonly type: TType;
    readonly source: typeof WEB_APP_MESSAGE_SOURCE;
    readonly payload: TPayload;
}

export type LoginMessagePayload = { token: string };
export type LoginMessage = BaseMessage<WebAppMessageType.LOGIN, LoginMessagePayload>;

export type LogoutMessage = BaseMessage<WebAppMessageType.LOGOUT>;

export type WebAppMessage =
    | LoginMessage
    | LogoutMessage;

export class MessageFactory {
    public static createLoginMessage(token: string): LoginMessage {
        return {
            type: WebAppMessageType.LOGIN,
            source: WEB_APP_MESSAGE_SOURCE,
            payload: { token },
        };
    }

    public static createLogoutMessage(): LogoutMessage {
        return {
            type: WebAppMessageType.LOGOUT,
            source: WEB_APP_MESSAGE_SOURCE,
            payload: undefined,
        };
    }
}
