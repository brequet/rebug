import { dashboardService } from '$lib/services/api';
import { authStore } from '$lib/stores/auth.svelte';
import { isApiError } from '$lib/types/api/ApiError';
import { isOk } from '$lib/types/Result';
import { requireAuth } from '$lib/utils/auth';
import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
    requireAuth();

    const result = await dashboardService.getDashboard();

    if (isOk(result)) {
        return {
            dashboard: result.data
        };
    } else {
        if (isApiError(result.error) && result.error.status === 401) {
            authStore.logout();
            throw redirect(303, '/login');
        }

        throw error(500, {
            message: 'Failed to load dashboard data',
        });
    }
};
