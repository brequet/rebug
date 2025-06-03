import { storage } from 'wxt/storage';
import type { AuthTokenData } from './types';

export const authStorage = {
    jwtToken: storage.defineItem<AuthTokenData | null>('local:auth:jwt_token', {
        fallback: null,
        version: 1,
    }),
};
