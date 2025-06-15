<script lang="ts">
	import type { ReportResponse } from '$lib/types/generated/ReportResponse';
	import { formatDateFromString } from '$lib/utils/date';
	import { Film, Image, TriangleAlert } from '@lucide/svelte';
	import 'hover-video-player';

	let { report, class: className = '' }: { report: ReportResponse; class?: string } = $props();

	const isScreenshot = $derived(report.report_type === 'Screenshot');
	const isVideo = $derived(report.report_type === 'Video');

	const formattedDate = $derived(formatDateFromString(report.created_at));

	let isImageError = $state(false);

	function handleImageError() {
		isImageError = true;
	}
</script>

<a href={`/reports/${report.id}`} class="group block {className}">
	<div class="bg-card text-card-foreground flex h-full flex-col overflow-hidden rounded-lg border">
		<!-- Media Preview -->
		<div
			class="bg-muted group-hover:shadow-primary/10 relative aspect-video w-full overflow-hidden rounded-t-md transition-shadow group-hover:shadow-lg"
		>
			{#if isScreenshot}
				{#if isImageError}
					<div class="absolute inset-0 flex items-center justify-center">
						<div class="text-muted-foreground flex flex-col items-center space-y-2 text-center">
							<TriangleAlert class="size-8" />
							<p class="text-xs">Image not found</p>
						</div>
					</div>
				{:else}
					<img
						src={report.file_path}
						alt={report.title}
						class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						onerror={handleImageError}
						loading="lazy"
					/>
				{/if}
			{:else if isVideo}
				<hover-video-player class="h-full w-full">
					<video src={report.file_path} loop muted playsinline class="h-full w-full object-cover"
					></video>
					<img
						src={report.thumbnail_file_path}
						alt="Video thumbnail for {report.title}"
						slot="paused-overlay"
						class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						loading="lazy"
					/>
				</hover-video-player>
			{/if}
		</div>

		<!-- Content -->
		<div class="flex flex-1 flex-col p-4">
			<h3 class="flex-1 font-semibold leading-snug">{report.title}</h3>
			<div class="text-muted-foreground mt-2 flex items-center justify-between text-xs">
				<span>{formattedDate}</span>
				{#if isScreenshot}
					<Image class="h-4 w-4" />
				{:else if isVideo}
					<Film class="h-4 w-4" />
				{/if}
			</div>
		</div>
	</div>
</a>
