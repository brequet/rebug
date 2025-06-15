import { reportsService } from '$lib/services/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const { reportId } = params;

    return {
        reportPromise: reportsService.getReport(reportId),
    };
};
