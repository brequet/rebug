import { MessageContext } from '../config/context';
import { BoardAction, GetBoardsMessage } from '../types';

export const boardMessageFactory = {
    getBoards(): GetBoardsMessage {
        return {
            type: BoardAction.GET_BOARDS,
            source: MessageContext.CONTENT_SCRIPT,
            target: MessageContext.BACKGROUND,
            payload: undefined
        }
    }
};
