import type { WEB_APP_MESSAGE_SOURCE } from './extension-messaging.config';

export enum WebAppMessageType {
    USER_ACTION = 'USER_ACTION',
    SUBMIT_DATA = 'SUBMIT_DATA',
}

export interface BaseWebAppMessage<T = any> {
    source: typeof WEB_APP_MESSAGE_SOURCE;
    type: WebAppMessageType | string;
    payload?: T;
}

export interface UserActionMessage extends BaseWebAppMessage<{ actionName: string; details: any }> {
    type: WebAppMessageType.USER_ACTION;
}

export interface SubmitDataMessage extends BaseWebAppMessage<{ data: any; formId: string }> {
    type: WebAppMessageType.SUBMIT_DATA;
}

export type WebAppMessage = UserActionMessage | SubmitDataMessage | BaseWebAppMessage;
