import type { ApiResult } from "$lib/services/api/types/ApiResult";
import type { DashboardResponse } from "$lib/types/generated/DashboardResponse";
import { get } from "../base";

export async function getDashboard(): Promise<ApiResult<DashboardResponse>> {
    return get<DashboardResponse>('dashboard');
}