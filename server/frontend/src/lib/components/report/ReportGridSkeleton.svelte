<script lang="ts">
	import ReportCardSkeleton from './ReportCardSkeleton.svelte';

	let { count = 8 }: { count?: number } = $props();
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
	{#each { length: count } as _}
		<ReportCardSkeleton />
	{/each}
</div>
