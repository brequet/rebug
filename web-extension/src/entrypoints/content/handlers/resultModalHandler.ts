import { createErrorResponse, createSuccessResponse, MessageProcessingResponse } from "$lib/types/messaging/base";
import { ShowResultModalMessage } from "$lib/types/messaging/tab";
import { openRebugResultModal } from "../ui/resultModal";


export async function handleShowResultModal(message: ShowResultModalMessage): Promise<MessageProcessingResponse> {
    console.log('Showing result modal...');
    try {
        openRebugResultModal(message);
        return createSuccessResponse();
    } catch (error) {
        return createErrorResponse((error as Error).message || 'Unknown error');
    }
}