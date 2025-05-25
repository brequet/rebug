import type { ApiResult } from '$lib/types/api/ApiResult';
import type { HealthResponse } from '$lib/types/generated/HealthResponse';
import { get } from '../base';

export async function fetchHealthStatus(): Promise<ApiResult<HealthResponse>> {
    return get<HealthResponse>('health');
}
