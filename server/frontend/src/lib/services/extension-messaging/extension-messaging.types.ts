import type { WEB_APP_MESSAGE_SOURCE } from './extension-messaging.config';

export enum WebAppMessageType {
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
}

export interface Message<
    TType extends string,
    TPayload = void,
> {
    readonly type: TType;
    readonly source: typeof WEB_APP_MESSAGE_SOURCE;
    readonly payload: TPayload;
}

export type LoginMessage = Message<
    WebAppMessageType.LOGIN,
    // TODO: Define a more specific type for the token, needs the JWT and some user info
    {
        userId: string;
        token: string;
    }
>;

export type LogoutMessage = Message<WebAppMessageType.LOGOUT>;

export type WebAppMessage =
    | LoginMessage
    | LogoutMessage;
