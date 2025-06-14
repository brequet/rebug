import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
    return { reportId: params.reportId };

    error(404, 'Not found');
};