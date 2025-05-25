import { authStore } from '$lib/stores/auth.svelte.js';
import { redirect } from '@sveltejs/kit';

export function requireAuth() {
    if (!authStore.isAuthenticated) {
        throw redirect(303, '/login');
    }
}

export function requireGuest() {
    if (authStore.isAuthenticated) {
        throw redirect(303, '/');
    }
}
