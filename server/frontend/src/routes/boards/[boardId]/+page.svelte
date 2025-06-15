<!-- src/routes/boards/[boardId]/+page.svelte -->
<script lang="ts">
	import BoardHeader from '$lib/components/board/BoardHeader.svelte';
	import ReportLoader from '$lib/components/board/ReportLoader.svelte';
	import ReportGridSkeleton from '$lib/components/report/ReportGridSkeleton.svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { isOk } from '$lib/types/Result';
	import { AlertCircle } from '@lucide/svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="container mx-auto px-4 py-8">
	{#await data.board}
		<div class="mb-8">
			<div class="bg-accent h-8 w-1/3 animate-pulse rounded-md"></div>
			<div class="bg-accent mt-2 h-6 w-1/2 animate-pulse rounded-md"></div>
		</div>
	{:then boardResult}
		{#if isOk(boardResult)}
			<BoardHeader board={boardResult.data} />
		{:else}
			<Alert variant="destructive">
				<AlertCircle class="size-4" />
				<AlertTitle>Error Loading Board</AlertTitle>
				<AlertDescription>{boardResult.error.message}</AlertDescription>
			</Alert>
		{/if}
	{/await}

	{#await data.reportsResult}
		<ReportGridSkeleton count={data.defaultPageSize} />
	{:then initialReportsResult}
		<ReportLoader {initialReportsResult} boardId={data.boardId} pageSize={data.defaultPageSize} />
	{/await}
</div>
