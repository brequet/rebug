import { BoardResponse, BoardService } from "$lib/board";
import { createErrorResponse, createSuccessResponse, GetBoardsMessage, MessageResponse } from "$lib/messaging/types";
import { logger } from "$lib/utils/logger";

const log = logger.getLogger('Background:BoardHandler');

export async function handleGetBoards(message: GetBoardsMessage): Promise<MessageResponse<BoardResponse[]>> {
    log.info(`Handling ${message.type}`, message.payload);

    try {
        const boards = await BoardService.getBoards()
        return createSuccessResponse(boards);
    } catch (error) {
        log.error('Error getting boards', error);
        return createErrorResponse((error as Error).message || 'Failed to get boards');
    }
}
