import { MessageContext } from '../config/context';
import { ReportingAction, SendReportMessage, SendReportPayload } from '../types';

export const reportingMessageFactory = {
    sendReport(
        payload: SendReportPayload
    ): SendReportMessage {
        return {
            type: ReportingAction.SEND_REPORT,
            source: MessageContext.CONTENT_SCRIPT,
            target: MessageContext.BACKGROUND,
            payload
        }
    }
};
