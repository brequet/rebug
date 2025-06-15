import { boardsService } from '$lib/services/api';
import type { PageLoad } from './$types';

const DEFAULT_PAGE_SIZE = 10;

export const load: PageLoad = async ({ params }) => {
    const { boardId } = params;

    return {
        board: boardsService.getBoard(boardId),
        reportsResult: boardsService.getBoardReports(boardId, { page: 1, pageSize: DEFAULT_PAGE_SIZE }),
        boardId,
        defaultPageSize: DEFAULT_PAGE_SIZE
    };
};
