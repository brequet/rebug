import { UserRole } from "$lib/user";

export interface JwtTokenPayload {
    sub: string; // Subject (user ID)
    email: string;
    role: UserRole;
    iat: number; // Issued at time
    exp: number; // Expiration time
}

export interface AuthTokenData {
    token: string;
    userId: string;
    userEmail: string;
    userRole: UserRole;
    expiresAt: number;
    issuedAt: number;
}

export interface StorageError {
    code: string;
    message: string;
}

