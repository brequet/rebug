import type { AuthTokenData } from './auth.types';

export const authStorage = {
    jwtToken: storage.defineItem<AuthTokenData | null>('local:auth:jwt_token', {
        fallback: null,
        version: 1,
    }),
};
