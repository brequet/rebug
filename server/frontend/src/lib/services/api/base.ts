import { ApiError, NetworkError } from '$lib/types/api/ApiError';
import type { ApiResult } from '$lib/types/api/ApiResult';
import { err, ok } from '$lib/types/Result';

const API_BASE_URL = '/api';

async function makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResult<T>> {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
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