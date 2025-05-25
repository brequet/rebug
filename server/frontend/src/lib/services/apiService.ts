import type { ApiErrorResponse, HealthStatusResponse } from '$lib/types/api';

const API_BASE_URL = '/api';

export async function get<T>(endpoint: string): Promise<T> {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`);
        if (!response.ok) {
            let errorData: ApiErrorResponse;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { error: `API request failed with status: ${response.status}` };
            }
            throw { status: response.status, message: errorData.error, data: errorData };
        }
        return response.json() as Promise<T>;
    } catch (error) {
        console.error(`Failed to GET ${endpoint}:`, error);
        if (typeof error === 'object' && error !== null && 'status' in error && 'message' in error) {
            throw error;
        }
        throw { status: 500, message: `Network error or unexpected issue fetching ${endpoint}.`, data: error };
    }
}


/**
 * Fetches the health status from the /api/health endpoint.
 * @param fetchFn - Optional fetch function. SvelteKit's `load` functions provide their own `fetch`.
 * @returns A promise that resolves to the HealthStatusResponse.
 * @throws An error object if the fetch fails or the response is not ok.
 */
export async function fetchHealthStatus(): Promise<HealthStatusResponse> {
    return get<HealthStatusResponse>('health');
}
