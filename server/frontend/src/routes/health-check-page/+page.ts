import { healthService } from '$lib/services/api';
import { ApiError } from '$lib/types/api/ApiError';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
    const result = await healthService.fetchHealthStatus();

    if (result.success) {
        return {
            healthStatus: result.data,
            error: null,
        };
    } else {
        console.error('Failed to load health status:', result.error);
        return {
            healthStatus: null,
            error: result.error.message,
            errorCode: result.error instanceof ApiError ? result.error.status : null,
        };
    }
};
