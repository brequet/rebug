<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { authStore } from '$lib/stores/auth.svelte.js';
	import { onMount } from 'svelte';

	onMount(() => {
		if (!authStore.isAuthenticated) {
			goto('/login');
		}
	});
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

{#if authStore.isAuthenticated}
	<div class="space-y-6">
		<div>
			<h1 class="text-foreground text-3xl font-bold">Dashboard</h1>
			<p class="text-muted-foreground">Welcome to your dashboard</p>
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			<div class="bg-card border-border rounded-lg border p-6">
				<h3 class="text-foreground mb-2 font-semibold">User Info</h3>
				<p class="text-muted-foreground text-sm">Email: {authStore.user?.email}</p>
				<p class="text-muted-foreground text-sm">Role: {authStore.user?.role}</p>
			</div>

			<div class="bg-card border-border rounded-lg border p-6">
				<h3 class="text-foreground mb-2 font-semibold">Quick Actions</h3>
				<Button variant="outline" class="w-full">View Profile</Button>
			</div>
		</div>
	</div>
{:else}
	<div class="text-center">
		<p class="text-muted-foreground">Redirecting to login...</p>
	</div>
{/if}
