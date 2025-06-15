import type { ApiResult } from "$lib/services/api/types/ApiResult";
import type { ReportResponse } from "$lib/types/generated/ReportResponse";
import { get } from "../base";

export async function getReport(reportId: string): Promise<ApiResult<ReportResponse>> {
    return get<ReportResponse>(`reports/${reportId}`);
}
