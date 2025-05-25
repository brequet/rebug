<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { authStore } from '$lib/stores/auth.svelte.js';
	import { onMount } from 'svelte';

	let email = $state('');
	let password = $state('');
	let errorMessage = $state<string | null>(null);

	onMount(() => {
		if (authStore.isAuthenticated) {
			goto('/');
		}
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();
		errorMessage = null;

		if (!email || !password) {
			errorMessage = 'Please fill in all fields';
			return;
		}

		const result = await authStore.login(email, password);

		if (!result.success) {
			errorMessage = result.error.message || 'An unexpected error occurred. Please try again.';
		}
	}
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<div class="bg-muted/30 flex min-h-screen items-center justify-center p-4">
	<Card.Root class="w-full max-w-md">
		<Card.Header class="space-y-1">
			<Card.Title class="text-2xl font-bold">Sign in to your REBUG account</Card.Title>
			<Card.Description>Enter your credentials to access your account</Card.Description>
		</Card.Header>

		<Card.Content>
			<form class="space-y-4" onsubmit={handleSubmit}>
				<div class="space-y-4">
					<div class="space-y-2">
						<Label for="email">Email address</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="Enter your email"
							bind:value={email}
							required
						/>
					</div>

					<div class="space-y-2">
						<Label for="password">Password</Label>
						<Input
							id="password"
							name="password"
							type="password"
							placeholder="Enter your password"
							bind:value={password}
							required
						/>
					</div>
				</div>

				{#if errorMessage}
					<div class="border-destructive/20 bg-destructive/10 rounded-md border p-4">
						<p class="text-destructive text-sm font-medium">{errorMessage}</p>
					</div>
				{/if}

				<Button type="submit" class="w-full" disabled={authStore.isLoading}>
					{authStore.isLoading ? 'Signing in...' : 'Sign in'}
				</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
