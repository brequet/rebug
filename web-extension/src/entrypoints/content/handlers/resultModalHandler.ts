import { createMessageProcessingResponse, MessageProcessingResponse, ResultModalType } from "$lib/types/messages";
import { openRebugResultModal } from "../ui/resultModal";


export async function handleShowResultModal(resultModalType: ResultModalType): Promise<MessageProcessingResponse> {
    console.log('Showing result modal...');
    try {
        openRebugResultModal(resultModalType);
        return createMessageProcessingResponse(true);
    } catch (error) {
        const errorMessage = (error as Error).message || 'Unknown error';
        return createMessageProcessingResponse(false, errorMessage);
    }
}