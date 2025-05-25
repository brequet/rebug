<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="p-2">
	<h1>API Health Status (via +page.ts load function)</h1>

	{#if data.healthStatus}
		<p class="text-green-500">
			<strong>Status:</strong>
			{data.healthStatus.status} - {data.healthStatus.message}
		</p>
	{:else if data.error}
		<p class="text-red-500">
			<strong>Error:</strong>
			{data.error}
		</p>
	{:else}
		<p>Loading status or an unexpected error occurred...</p>
	{/if}

	<p><a href="/">Go Home</a></p>
</div>
