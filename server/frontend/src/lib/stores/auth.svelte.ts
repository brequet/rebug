import { goto } from '$app/navigation';
import { authService } from '$lib/services/api';
import type { LoginResponse } from '$lib/types/generated/LoginResponse';
import type { UserResponse } from '$lib/types/generated/UserResponse';
import { err, isOk, type Result } from '$lib/types/Result';

interface ExtensionAuthMessage {
    type: 'AUTH_SUCCESS' | 'AUTH_LOGOUT' | 'AUTH_CHECK' | 'EXTENSION_INSTALLED';
    token?: string;
    user?: UserResponse;
    timestamp?: number;
}

class AuthStore {
    user: UserResponse | null = $state(null);
    token: string | null = $state(null);
    isAuthenticated = $derived(!!this.token && !!this.user);
    isLoading = $state(false);
    extensionInstalled = $state(false);

    constructor() {
        this.loadFromStorage();
        this.initializeExtensionCommunication();
    }

    private initializeExtensionCommunication(): void {
        window.addEventListener('message', this.handleExtensionMessage.bind(this));

        this.checkExtensionInstalled();

        if (this.isAuthenticated) {
            this.notifyExtension('AUTH_SUCCESS');
        }
    } private checkExtensionInstalled(): void {
        window.postMessage({
            type: 'CHECK_EXTENSION_INSTALLED',
            source: 'website'
        }, '*');

        // Extension will respond if installed
        setTimeout(() => {
            if (!this.extensionInstalled) {
                console.log('Extension not detected');
            }
        }, 1000);
    }

    private handleExtensionMessage = (event: MessageEvent<ExtensionAuthMessage>): void => {
        // Only handle messages from our extension
        if (event.source !== window || !event.data.type) return;

        switch (event.data.type) {
            case 'EXTENSION_INSTALLED':
                this.extensionInstalled = true;
                console.log('Extension detected and connected');
                if (this.isAuthenticated) {
                    this.notifyExtension('AUTH_SUCCESS');
                }
                break;

            case 'AUTH_LOGOUT':
                this.handleExtensionLogout();
                break;

            case 'AUTH_CHECK':
                if (this.isAuthenticated) {
                    this.notifyExtension('AUTH_SUCCESS');
                }
                break;
        }
    };

    private notifyExtension(type: 'AUTH_SUCCESS' | 'AUTH_LOGOUT'): void {
        const message: ExtensionAuthMessage = {
            type,
            timestamp: Date.now()
        };

        if (type === 'AUTH_SUCCESS' && this.token && this.user) {
            message.token = this.token;
            message.user = this.user;
        }

        window.postMessage({
            ...message,
            source: 'website'
        }, '*');
    }

    private handleExtensionLogout(): void {
        this.clearAuth();
        goto('/login');
    }

    loadFromStorage(): void {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            try {
                this.token = storedToken;
                this.user = JSON.parse(storedUser);
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

            this.notifyExtension('AUTH_SUCCESS');

            this.isLoading = false;

            goto('/');

            return result;
        } else {
            this.isLoading = false;

            return err(result.error || 'Login failed');
        }

    }

    logout(): void {
        this.notifyExtension('AUTH_LOGOUT');

        this.clearAuth();

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
