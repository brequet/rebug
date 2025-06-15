export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly data?: unknown
    ) {
        super(message);
        this.name = 'ApiError';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ('captureStackTrace' in Error && typeof (Error as any).captureStackTrace === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (Error as any).captureStackTrace(this, this.constructor);
        }
    }
}

export class NetworkError extends Error {
    constructor(message: string, public readonly cause?: unknown) {
        super(message);
        this.name = 'NetworkError';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ('captureStackTrace' in Error && typeof (Error as any).captureStackTrace === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (Error as any).captureStackTrace(this, this.constructor);
        }
    }
}

export type ApiErrorType = ApiError | NetworkError

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

export function isNetworkError(error: unknown): error is NetworkError {
    return error instanceof NetworkError;
}
