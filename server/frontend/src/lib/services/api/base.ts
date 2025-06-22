import { ApiError, NetworkError } from '$lib/services/api/types/ApiError';
import type { ApiResult } from '$lib/services/api/types/ApiResult';
import type { PaginationParams } from '$lib/services/api/types/PaginationParams';
import { authStore } from '$lib/stores/auth.svelte';
import type { PaginatedResponse } from '$lib/types/generated/PaginatedResponse';
import { err, ok } from '$lib/types/Result';

const API_BASE_URL = '/api';

// TODO: pass fetch function for sveltekit custom fetch
async function makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResult<T>> {
    try {
        const authHeader = authStore.getAuthHeader();

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers as Record<string, string>,
        };

        if (authHeader) {
            headers.Authorization = authHeader;
        }

        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            headers,
            ...options,
        });

        if (!response.ok) {
            if (response.status === 401 && authHeader) {
                authStore.logout();
            }

            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { error: `HTTP ${response.status}` };
            }
            return err(new ApiError(errorData.error || 'Request failed', response.status, errorData));
        }

        const data = await response.json();
        return ok(data);
    } catch (error) {
        return err(new NetworkError(
            `Network error or unexpected issue with ${endpoint}`,
            error
        ));
    }
}

export async function get<T>(endpoint: string): Promise<ApiResult<T>> {
    return makeRequest<T>(endpoint, { method: 'GET' });
}

export async function getPaginated<ItemType>(
    endpoint: string,
    params: PaginationParams = {}
): Promise<ApiResult<PaginatedResponse<ItemType>>> {
    const { page, pageSize } = params;
    const queryParams = new URLSearchParams();

    if (page !== undefined) {
        queryParams.append('page', page.toString());
    }
    if (pageSize !== undefined) {
        queryParams.append('per_page', pageSize.toString());
    }

    const queryString = queryParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return get<PaginatedResponse<ItemType>>(url);
}

export async function post<T>(endpoint: string, data?: unknown): Promise<ApiResult<T>> {
    return makeRequest<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
    });
}

export async function put<T>(endpoint: string, data?: unknown): Promise<ApiResult<T>> {
    return makeRequest<T>(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
    });
}

export async function del<T>(endpoint: string): Promise<ApiResult<T>> {
    return makeRequest<T>(endpoint, { method: 'DELETE' });
}