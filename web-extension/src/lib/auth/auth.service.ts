import { logger } from "$lib/utils/logger";
import { authStorage } from "./auth.storage";
import { AuthTokenData, JwtTokenPayload, User, UserRole } from "./types";

const log = logger.getLogger('AuthService');

export class AuthService {
    static async saveToken(token: string): Promise<void> {
        try {
            const payload = this.parseTokenPayload(token);

            const tokenData: AuthTokenData = {
                token,
                userId: payload.sub,
                userEmail: payload.email,
                userRole: payload.role,
                issuedAt: payload.iat * 1000,
                expiresAt: payload.exp * 1000
            };

            await authStorage.jwtToken.setValue(tokenData);
            log.info('JWT token saved successfully');
        } catch (error) {
            log.error('Failed to save JWT token', error);
            throw new Error('Failed to save authentication token');
        }
    }

    static async getToken(): Promise<string | null> {
        try {
            const tokenData = await authStorage.jwtToken.getValue();

            if (!tokenData) {
                return null;
            }

            if (this.isTokenExpired(tokenData)) {
                log.warn('JWT token has expired, removing from storage');
                await this.revokeToken();
                return null;
            }

            return tokenData.token;
        } catch (error) {
            log.error('Failed to retrieve JWT token', error);
            return null;
        }
    }

    static async getTokenData(): Promise<AuthTokenData | null> {
        try {
            const tokenData = await authStorage.jwtToken.getValue();

            if (!tokenData) {
                return null;
            }

            if (this.isTokenExpired(tokenData)) {
                log.warn('JWT token has expired, removing from storage');
                await this.revokeToken();
                return null;
            }

            return tokenData;
        } catch (error) {
            log.error('Failed to retrieve JWT token data', error);
            return null;
        }
    }

    static async revokeToken(): Promise<void> {
        try {
            await authStorage.jwtToken.removeValue();
            log.info('JWT token revoked successfully');
        } catch (error) {
            log.error('Failed to revoke JWT token', error);
            throw new Error('Failed to revoke authentication token');
        }
    }

    static async isAuthenticated(): Promise<boolean> {
        const token = await this.getToken();
        return token !== null;
    }

    static async getCurrentUser(): Promise<User | null> {
        const tokenData = await this.getTokenData();

        if (!tokenData) {
            return null;
        }

        return {
            userId: tokenData.userId,
            email: tokenData.userEmail,
            role: tokenData.userRole
        };
    }

    static async hasRole(requiredRole: UserRole): Promise<boolean> {
        const user = await this.getCurrentUser();
        return user?.role === requiredRole;
    }

    static async isAdmin(): Promise<boolean> {
        return this.hasRole(UserRole.ADMIN);
    }

    private static parseTokenPayload(token: string): JwtTokenPayload {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid JWT format');
            }

            const payload = JSON.parse(atob(parts[1]));

            if (!payload.sub || !payload.email || !payload.role || !payload.iat || !payload.exp) {
                throw new Error('Missing required JWT payload fields');
            }

            if (!Object.values(UserRole).includes(payload.role)) {
                throw new Error('Invalid user role in JWT payload');
            }

            return payload as JwtTokenPayload;
        } catch (error) {
            log.error('Failed to parse JWT token', error);
            throw new Error('Invalid JWT token format');
        }
    }

    private static isTokenExpired(tokenData: AuthTokenData): boolean {
        return Date.now() > tokenData.expiresAt;
    }
}
