import type { ApiResult } from "$lib/services/api/types/ApiResult";
import type { PaginationParams } from "$lib/services/api/types/PaginationParams";
import type { BoardResponse } from "$lib/types/generated/BoardResponse";
import type { PaginatedResponse } from "$lib/types/generated/PaginatedResponse";
import type { ReportResponse } from "$lib/types/generated/ReportResponse";
import { get, getPaginated } from "../base";

export async function getBoards(): Promise<ApiResult<BoardResponse[]>> {
    return get<BoardResponse[]>('boards');
}

export async function getBoard(boardId: string): Promise<ApiResult<BoardResponse>> {
    return get<BoardResponse>(`boards/${boardId}`);
}

export async function getBoardReports(
    boardId: string,
    paginationParams?: PaginationParams
): Promise<ApiResult<PaginatedResponse<ReportResponse>>> {
    return getPaginated<ReportResponse>(`boards/${boardId}/reports`, paginationParams);
}