import type { ApiResult } from "$lib/types/api/ApiResult";
import type { LoginRequest } from "$lib/types/generated/LoginRequest";
import type { LoginResponse } from "$lib/types/generated/LoginResponse";
import { post } from "../base";

export async function login(loginRequest: LoginRequest): Promise<ApiResult<LoginResponse>> {
    return post<LoginResponse>("auth/login", loginRequest);
}