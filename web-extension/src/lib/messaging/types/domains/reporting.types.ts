import { MessageContext } from "$lib/messaging/config/context";
import { SendReportPayload } from "$lib/report";
import { Message } from "../base";

export enum ReportingAction {
    SEND_REPORT = 'SEND_REPORT',
}

export type SendReportMessage = Message<
    ReportingAction.SEND_REPORT,
    MessageContext.CONTENT_SCRIPT,
    MessageContext.BACKGROUND,
    SendReportPayload
>;

export type ReportingMessage =
    | SendReportMessage;