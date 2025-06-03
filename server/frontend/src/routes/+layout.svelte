<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import { authStore } from '$lib/stores/auth.svelte.js';
	import '../app.css';

	let { children } = $props();
</script>

<div class="bg-background min-h-screen">
	{#if authStore.isAuthenticated}
		<Header />
	{/if}

	<main>
		{@render children()}
	</main>
</div>
