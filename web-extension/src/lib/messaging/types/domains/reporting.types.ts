import { MessageContext } from "$lib/messaging/config/context";
import { ReportType } from "$lib/report";
import { Message } from "../base";

export enum ReportingAction {
    SEND_REPORT = 'SEND_REPORT',
}

export type SendReportPayload = {
    boardId: string;
    title: string;
    description?: string;
    originUrl?: string;
    mediaData: string; // Base64 encoded data
    mediaType: ReportType;
}

export type SendReportMessage = Message<
    ReportingAction.SEND_REPORT,
    MessageContext.CONTENT_SCRIPT,
    MessageContext.BACKGROUND,
    SendReportPayload
>;

export type ReportingMessage =
    | SendReportMessage;