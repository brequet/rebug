import type { ApiErrorType } from "$lib/types/api/ApiError";
import type { Result } from "../Result";

export type ApiResult<T> = Result<T, ApiErrorType>
