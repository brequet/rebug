import { goto } from '$app/navigation';
import { authService } from '$lib/services/api';
import { extensionMessagingService, MessageFactory, WebAppMessageType, type LoginMessage } from '$lib/services/extension-messaging';
import type { LoginResponse } from '$lib/types/generated/LoginResponse';
import type { UserResponse } from '$lib/types/generated/UserResponse';
import { err, isOk, type Result } from '$lib/types/Result';

class AuthStore {
    user: UserResponse | null = $state(null);
    token: string | null = $state(null);
    isAuthenticated = $derived(!!this.token && !!this.user);
    isLoading = $state(false);

    constructor() {
        this.loadFromStorage();
    }

    loadFromStorage(): void {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            try {
                this.token = storedToken;
                this.user = JSON.parse(storedUser);

                const loginMessage = MessageFactory.createLoginMessage(this.token);
                extensionMessagingService.sendMessage(loginMessage);
            } catch (error) {
                console.error('Failed to parse stored user data:', error);
                this.clearAuth();
            }
        }
    }

    async login(email: string, password: string): Promise<Result<LoginResponse, Error>> {
        this.isLoading = true;

        const result = await authService.login({ email, password });

        if (isOk(result)) {
            const { access_token, user } = result.data;

            this.token = access_token;
            this.user = user;

            localStorage.setItem('auth_token', access_token);
            localStorage.setItem('auth_user', JSON.stringify(user));

            const loginMessage = MessageFactory.createLoginMessage(access_token);
            extensionMessagingService.sendMessage(loginMessage);

            this.isLoading = false;

            goto('/');

            return result;
        } else {
            this.isLoading = false;

            return err(result.error || 'Login failed');
        }

    }

    logout(): void {
        this.token = null;
        this.user = null;

        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');

        const logoutMessage = MessageFactory.createLogoutMessage();
        extensionMessagingService.sendMessage(logoutMessage);

        goto('/login');
    }

    clearAuth(): void {
        this.token = null;
        this.user = null;

        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    }

    getAuthHeader(): string | null {
        return this.token ? `Bearer ${this.token}` : null;
    }
}

export const authStore = new AuthStore();
