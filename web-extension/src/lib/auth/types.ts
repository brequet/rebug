export interface AuthTokenData {
    token: string;
    expiresAt?: number;
    issuedAt: number;
}

export interface StorageError {
    code: string;
    message: string;
}
