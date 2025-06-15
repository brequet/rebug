export interface ErrorInterface {
    getErrorStatus(): number;
}

export class ApiError extends Error implements ErrorInterface {
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

    getErrorStatus(): number {
        return this.status;
    }
}

export class NetworkError extends Error implements ErrorInterface {
    constructor(message: string, public readonly cause?: unknown) {
        super(message);
        this.name = 'NetworkError';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ('captureStackTrace' in Error && typeof (Error as any).captureStackTrace === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (Error as any).captureStackTrace(this, this.constructor);
        }
    }

    getErrorStatus(): number {
        return 0; // Network errors do not have a specific HTTP status code
    }
}

export type ApiErrorType = ApiError | NetworkError

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

export function isNetworkError(error: unknown): error is NetworkError {
    return error instanceof NetworkError;
}
