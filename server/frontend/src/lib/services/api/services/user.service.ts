import type { ApiResult } from "$lib/services/api/types/ApiResult";
import type { UserResponse } from "$lib/types/generated/UserResponse";
import { get } from "../base";

export async function getMe(): Promise<ApiResult<UserResponse>> {
    return get<UserResponse>('users/me');
}