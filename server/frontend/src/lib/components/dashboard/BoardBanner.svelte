<script lang="ts">
	import type { BoardWithRecentReports } from '$lib/types/generated/BoardWithRecentReports';
	import { formatDateFromString } from '$lib/utils/date';
	import ReportCard from './ReportCard.svelte';

	let { boardWithReports }: { boardWithReports: BoardWithRecentReports } = $props();

	const { board, recent_reports } = boardWithReports;

	const formattedDate = $state(formatDateFromString(board.created_at));
</script>

<div class="w-full">
	<div class="pb-4">
		<div class="flex items-start justify-between">
			<div class="space-y-1">
				<h2 class="text-xl font-semibold">
					{board.name}
					{#if board.is_default}
						<span
							class="bg-primary/10 text-primary ml-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
						>
							Default
						</span>
					{/if}
				</h2>
				{#if board.description}
					<p class="text-muted-foreground text-sm">
						{board.description}
					</p>
				{/if}
			</div>
		</div>
	</div>

	<div>
		{#if recent_reports.length === 0}
			<div class="text-muted-foreground py-8 text-center">
				<svg class="mx-auto mb-2 h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				<p class="text-sm">No reports yet</p>
			</div>
		{:else}
			<!-- Horizontal scrolling container -->
			<div class="relative">
				<div
					class="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border flex gap-4 overflow-x-auto pb-4"
				>
					{#each recent_reports as report (report.id)}
						<ReportCard {report} />
					{/each}
					<!-- TODO: add a last element if more than 5 to say how many more are in the board-->
				</div>

				<!-- Scroll indicator gradient -->
				{#if recent_reports.length > 3}
					<div
						class="from-background pointer-events-none absolute bottom-4 right-0 top-0 w-8 bg-gradient-to-l to-transparent"
					></div>
				{/if}
			</div>
		{/if}
	</div>
</div>
