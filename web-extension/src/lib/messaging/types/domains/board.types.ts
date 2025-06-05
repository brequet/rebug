import { MessageContext } from "$lib/messaging/config/context";
import { Message } from "../base";

export enum BoardAction {
    GET_BOARDS = 'GET_BOARDS',
}

export type GetBoardsMessage = Message<
    BoardAction.GET_BOARDS,
    MessageContext.CONTENT_SCRIPT,
    MessageContext.BACKGROUND
>;

export type BoardMessage =
    | GetBoardsMessage;
