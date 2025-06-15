<script lang="ts">
	import { healthService } from '$lib/services/api';
	import { ApiError } from '$lib/services/api/types/ApiError';
	import type { HealthResponse } from '$lib/types/generated/HealthResponse';
	import { isOk } from '$lib/types/Result';
	import Button from './ui/button/button.svelte';

	let healthStatus = $state<HealthResponse | null>(null);
	let errorMessage = $state<string | null>(null);
	let isLoading = $state<boolean>(false);

	async function checkApiHealth() {
		isLoading = true;
		errorMessage = null;
		healthStatus = null;

		const result = await healthService.fetchHealthStatus();

		if (isOk(result)) {
			healthStatus = result.data;
		} else {
			const error = result.error;
			if (error instanceof ApiError) {
				errorMessage = `API Error (${error.status}): ${error.message}`;
			} else {
				errorMessage = error.message;
			}
		}

		isLoading = false;
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
