import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
    return { boardId: params.boardId };

    error(404, 'Not found');
};