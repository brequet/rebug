<script lang="ts">
	import type { BoardWithRecentReports } from '$lib/types/generated/BoardWithRecentReports';
	import { FileText } from '@lucide/svelte';
	import ReportCard from '../report/ReportCard.svelte';

	let { boardWithReports }: { boardWithReports: BoardWithRecentReports } = $props();

	const { board, recent_reports } = boardWithReports;
</script>

<div class="w-full">
	<div class="pb-4">
		<div class="flex items-start justify-between">
			<a class="space-y-1" href="/boards/{board.id}">
				<h2 class="text-xl font-semibold tracking-tight">
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
			</a>
		</div>
	</div>

	<div>
		{#if recent_reports.length === 0}
			<div
				class="text-muted-foreground flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-8"
			>
				<FileText class="mb-2 size-8" />
				<p class="text-sm">No recent reports</p>
			</div>
		{:else}
			<div class="relative">
				<div
					class="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border -mx-1 flex gap-4 overflow-x-auto px-1 pb-4"
				>
					{#each recent_reports as report (report.id)}
						<ReportCard {report} class="w-72 flex-shrink-0" />
					{/each}
				</div>

				<!-- Right fade -->
				{#if recent_reports.length > 3}
					<div
						class="from-background pointer-events-none absolute bottom-4 right-0 top-0 w-16 bg-gradient-to-l to-transparent"
					></div>
				{/if}
			</div>
		{/if}
	</div>
</div>
