import { fetchHealthStatus } from '$lib/services/apiService';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
    try {
        const status = await fetchHealthStatus();
        return {
            healthStatus: status,
            error: null,
        };
    } catch (e: any) {
        console.error('Failed to load health status in +page.ts:', e);
        return {
            healthStatus: null,
            error: e.message || 'Failed to load API health status.',
        };
    }
};
