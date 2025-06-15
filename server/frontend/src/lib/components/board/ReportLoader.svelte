<script lang="ts">
	import ReportList from '$lib/components/board/ReportList.svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { boardsService } from '$lib/services/api';
	import type { ApiResult } from '$lib/services/api/types/ApiResult';
	import type { PaginatedResponse } from '$lib/types/generated/PaginatedResponse';
	import type { ReportResponse } from '$lib/types/generated/ReportResponse';
	import { isOk } from '$lib/types/Result';
	import { AlertCircle } from '@lucide/svelte';

	type Props = {
		initialReportsResult: ApiResult<PaginatedResponse<ReportResponse>>;
		boardId: string;
		pageSize: number;
	};

	let { initialReportsResult, boardId, pageSize }: Props = $props();

	let reports = $state<ReportResponse[]>(
		isOk(initialReportsResult) ? initialReportsResult.data.items : []
	);
	let hasMore = $state(
		isOk(initialReportsResult) ? initialReportsResult.data.has_next_page : false
	);
	let currentPage = $state(isOk(initialReportsResult) ? initialReportsResult.data.page : 1);
	let isLoadingMore = $state(false);
	let loadError = $state<string | null>(null);

	async function loadMoreReports() {
		if (isLoadingMore || !hasMore) return;

		isLoadingMore = true;
		loadError = null;

		const nextPage = currentPage + 1;
		const result = await boardsService.getBoardReports(boardId, {
			page: nextPage,
			pageSize
		});

		if (isOk(result)) {
			reports.push(...result.data.items);
			hasMore = result.data.has_next_page;
			currentPage = result.data.page;
		} else {
			loadError = result.error.message;
		}

		isLoadingMore = false;
	}
</script>

{#if isOk(initialReportsResult)}
	<ReportList {reports} {hasMore} {isLoadingMore} onLoadMore={loadMoreReports} />

	{#if loadError}
		<Alert variant="destructive" class="mt-4">
			<AlertCircle class="size-4" />
			<AlertTitle>Could Not Load More Reports</AlertTitle>
			<AlertDescription>{loadError}</AlertDescription>
		</Alert>
	{/if}
{:else}
	<Alert variant="destructive">
		<AlertCircle class="size-4" />
		<AlertTitle>Error Loading Reports</AlertTitle>
		<AlertDescription>{initialReportsResult.error.message}</AlertDescription>
	</Alert>
{/if}
