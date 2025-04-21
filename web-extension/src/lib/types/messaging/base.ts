/**
 * Base interface for all message types, ensuring a 'type' property exists.
 * @template T The type of the message type identifier (usually a string enum).
 */
export interface MessageBase<T> {
    readonly type: T;
}

/**
 * Standardized response structure for message processing handlers.
 */
export interface MessageProcessingResponse<TData = unknown> {
    success: boolean;
    error?: string;
    data?: TData;
}

/**
 * Factory function to create a standardized message processing response.
 * @param success Indicates if the operation was successful.
 * @param error Optional error message if success is false.
 * @param data Optional data payload if success is true.
 * @returns A MessageProcessingResponse object.
 */
export function createMessageProcessingResponse<TData = unknown>(
    success: boolean,
    error?: string,
    data?: TData
): MessageProcessingResponse<TData> {
    return { success, error, data };
}

export type SuccessResponse<TData = unknown> = MessageProcessingResponse<TData>;
export type ErrorResponse = MessageProcessingResponse<never>;

export function createSuccessResponse<TData = unknown>(data?: TData): SuccessResponse<TData> {
    return createMessageProcessingResponse(true, undefined, data);
}

export function createErrorResponse(error: string): ErrorResponse {
    return createMessageProcessingResponse(false, error);
}
