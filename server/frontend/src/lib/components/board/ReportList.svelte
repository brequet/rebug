<script lang="ts">
	import ReportCard from '$lib/components/report/ReportCard.svelte';
	import { Button } from '$lib/components/ui/button';
	import type { ReportResponse } from '$lib/types/generated/ReportResponse';
	import { FileText, LoaderCircle } from '@lucide/svelte';

	let {
		reports,
		hasMore,
		isLoadingMore,
		onLoadMore
	}: {
		reports: ReportResponse[];
		hasMore: boolean;
		isLoadingMore: boolean;
		onLoadMore: () => unknown;
	} = $props();
</script>

{#if reports.length > 0}
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
		{#each reports as report (report.id)}
			<ReportCard {report} />
		{/each}
	</div>
{/if}

{#if hasMore}
	<div class="mt-8 flex justify-center">
		<Button
			variant="outline"
			onclick={onLoadMore}
			disabled={isLoadingMore}
			class="w-full sm:w-auto"
		>
			{#if isLoadingMore}
				<LoaderCircle class="mr-2 size-4 animate-spin" />
				Loading...
			{:else}
				Load More
			{/if}
		</Button>
	</div>
{/if}

{#if reports.length === 0 && !isLoadingMore}
	<div
		class="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12"
	>
		<FileText class="text-muted-foreground mb-4 size-12" />
		<h3 class="text-lg font-semibold">No Reports Found</h3>
		<p class="text-muted-foreground text-sm">This board doesn't have any reports yet.</p>
	</div>
{/if}
