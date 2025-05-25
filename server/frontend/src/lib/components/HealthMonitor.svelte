<script lang="ts">
	import { fetchHealthStatus } from '$lib/services/apiService';
	import type { HealthStatusResponse } from '$lib/types/api';
	import Button from './ui/button/button.svelte';

	let healthStatus = $state<HealthStatusResponse | null>(null);
	let errorMessage = $state<string | null>(null);
	let isLoading = $state<boolean>(false);

	async function checkApiHealth() {
		isLoading = true;
		errorMessage = null;
		healthStatus = null;
		try {
			healthStatus = await fetchHealthStatus();
		} catch (e: any) {
			errorMessage = e.message || 'An unknown error occurred while fetching health status.';
			console.error('Error details:', e);
		} finally {
			isLoading = false;
		}
	}
</script>

<div>
	<Button onclick={checkApiHealth} disabled={isLoading}>
		{isLoading ? 'Checking API Health...' : 'Check API Health'}
	</Button>

	{#if healthStatus}
		<p class="text-green-500">
			<strong>Status:</strong>
			{healthStatus.status} - {healthStatus.message}
		</p>
	{/if}

	{#if errorMessage}
		<p class="text-red-500">
			<strong>Error:</strong>
			{errorMessage}
		</p>
	{/if}
</div>
