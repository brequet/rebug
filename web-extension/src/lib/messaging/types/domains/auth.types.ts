import { MessageContext } from "$lib/messaging/config/context";
import { Message } from "../base";

export enum AuthAction {
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",

    SAVE_TOKEN = "SAVE_TOKEN",
    REVOKE_TOKEN = "REVOKE_TOKEN"
}

export type LoginMessagePayload = { token: string };
export type LoginMessage = Message<
    AuthAction.LOGIN,
    MessageContext.WEB_APP,
    MessageContext.CONTENT_SCRIPT,
    LoginMessagePayload
>;

export type LogoutMessage = Message<
    AuthAction.LOGOUT,
    MessageContext.WEB_APP,
    MessageContext.CONTENT_SCRIPT
>;

export type SaveTokenPayload = { token: string };
export type SaveTokenMessage = Message<
    AuthAction.SAVE_TOKEN,
    MessageContext.CONTENT_SCRIPT,
    MessageContext.BACKGROUND,
    SaveTokenPayload
>;

export type RevokeTokenMessage = Message<
    AuthAction.REVOKE_TOKEN,
    MessageContext.CONTENT_SCRIPT,
    MessageContext.BACKGROUND
>;

export type AuthMessage =
    | LoginMessage
    | LogoutMessage
    | SaveTokenMessage
    | RevokeTokenMessage;
