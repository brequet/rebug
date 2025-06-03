import { logger } from "$lib/utils/logger";
import { authStorage } from "./auth.storage";
import { AuthTokenData } from "./types";

const log = logger.getLogger('AuthService');

export class AuthService {
    /**
     * Save JWT token to storage
     */
    static async saveToken(token: string): Promise<void> {
        try {
            const { issuedAt, expiration } = this.parseToken(token) || {};
            if (!issuedAt || !expiration) {
                throw new Error('Invalid JWT token format');
            }

            const tokenData: AuthTokenData = {
                token,
                issuedAt: issuedAt,
                expiresAt: expiration
            };

            await authStorage.jwtToken.setValue(tokenData);
            log.info('JWT token saved successfully');
        } catch (error) {
            log.error('Failed to save JWT token', error);
            throw new Error('Failed to save authentication token');
        }
    }

    /**
     * Retrieve JWT token from storage
     */
    static async getToken(): Promise<string | null> {
        try {
            const tokenData = await authStorage.jwtToken.getValue();

            if (!tokenData) {
                return null;
            }

            // Check if token is expired
            if (tokenData.expiresAt && Date.now() > tokenData.expiresAt) {
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

    /**
     * Revoke (remove) JWT token from storage
     */
    static async revokeToken(): Promise<void> {
        try {
            await authStorage.jwtToken.removeValue();
            log.info('JWT token revoked successfully');
        } catch (error) {
            log.error('Failed to revoke JWT token', error);
            throw new Error('Failed to revoke authentication token');
        }
    }

    /**
     * Check if user is authenticated
     */
    static async isAuthenticated(): Promise<boolean> {
        const token = await this.getToken();
        return token !== null;
    }

    /**
     * Parse JWT token to extract expiration time
     * This is a basic implementation - you might want to use a JWT library
     */
    private static parseToken(token: string): { issuedAt: number, expiration: number } | undefined {
        try {
            const payload = token.split('.')[1];
            if (!payload) return undefined;

            const decoded = JSON.parse(atob(payload));

            return {
                issuedAt: decoded.iat * 1000,
                expiration: decoded.exp * 1000
            }
        } catch (error) {
            log.warn('Failed to parse JWT expiration', error);
            return undefined;
        }
    }
}
