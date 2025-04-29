import { MessageContext } from '../config/context';

/** Base structure for all messages */
export interface Message<
    TType extends string,
    TSource extends MessageContext,
    TTarget extends MessageContext,
    TPayload = void, // Use void for messages without payload
> {
    readonly type: TType;
    readonly source: TSource;
    readonly target: TTarget;
    // Conditionally add payload if TPayload is not void
    readonly payload: TPayload;
}

/** Standardized response structure */
export type MessageResponse<TData = unknown> =
    | { success: true; data?: TData }
    | { success: false; error: string };

/** Type guard for success response */
export function isSuccessResponse<T>(
    response: MessageResponse<T>
): response is { success: true; data?: T } {
    return response.success;
}

/** Type guard for error response */
export function isErrorResponse<T>(
    response: MessageResponse<T>
): response is { success: false; error: string } {
    return !response.success;
}

/** Factory for success responses */
export function createSuccessResponse<TData = unknown>(
    data?: TData
): MessageResponse<TData> {
    return { success: true, data };
}

/** Factory for error responses */
export function createErrorResponse(error: string): MessageResponse<never> {
    return { success: false, error };
}
