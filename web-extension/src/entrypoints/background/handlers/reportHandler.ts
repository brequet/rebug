import { createErrorResponse, createSuccessResponse, MessageResponse, SendReportMessage } from "$lib/messaging/types";
import { ReportResponse, ReportService } from "$lib/report";
import { logger } from "$lib/utils/logger";

const log = logger.getLogger('Background:ReportHandler');

export async function handleSendReport(message: SendReportMessage): Promise<MessageResponse<ReportResponse>> {
    log.info(`Handling ${message.type}`, message.payload);

    try {
        const reportResponse = await ReportService.sendReport(message.payload)
        if (!reportResponse) {
            log.error('No report response received');
            return createErrorResponse('No report response received');
        }
        log.info('Report sent successfully', reportResponse);
        return createSuccessResponse(reportResponse);
    } catch (error) {
        log.error('Error getting boards', error);
        return createErrorResponse((error as Error).message || 'Failed to get boards');
    }
}
