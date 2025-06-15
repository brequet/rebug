import type { ApiErrorType } from "$lib/services/api/types/ApiError";
import type { Result } from "$lib/types/Result";

export type ApiResult<T> = Result<T, ApiErrorType>
