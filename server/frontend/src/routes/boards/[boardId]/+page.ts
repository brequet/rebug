import { boardsService } from '$lib/services/api';
import { isErr } from '$lib/types/Result';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const { boardId } = params;

    const [boardResult, reportsResult] = await Promise.all([
        boardsService.getBoard(boardId),
        boardsService.getBoardReports(boardId, { page: 1, pageSize: 2 })
    ]);

    if (isErr(boardResult)) {
        error(boardResult.error.getErrorStatus(), `Failed to load board: ${boardResult.error.message}`);
    }

    return {
        board: boardResult.data,
        reportsResult,
        boardId
    };
};
