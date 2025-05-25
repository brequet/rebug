// TODO: generates this from rust models

export interface HealthStatusResponse {
    status: string;
    message: string;
}

// You might also define a common error response structure
export interface ApiErrorResponse {
    error: string;
    details?: any;
}
