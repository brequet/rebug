<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import type { ReportResponse } from '$lib/types/generated/ReportResponse';
	import { formatDateFromString } from '$lib/utils/date';
	import { ExternalLink, Film, Image, TriangleAlert } from '@lucide/svelte';

	let { report }: { report: ReportResponse } = $props();

	const isScreenshot = $derived(report.report_type === 'Screenshot');
	const isVideo = $derived(report.report_type === 'Video');

	const formattedDate = $state(formatDateFromString(report.created_at));

	let isImageError = $state(false);

	function handleImageError() {
		isImageError = true;
	}
</script>

<Card class="w-72 flex-shrink-0 overflow-hidden transition-all duration-200 hover:shadow-md">
	<CardHeader>
		<CardTitle class="flex min-w-0 items-center gap-2 truncate text-sm font-medium">
			<span class="truncate">
				{report.title}
			</span>
			<span class="text-muted-foreground flex-shrink-0">
				{#if isScreenshot}
					<Image class="h-4 w-4" />
				{:else if isVideo}
					<Film class="h-4 w-4" />
				{/if}
			</span>
		</CardTitle>
	</CardHeader>

	<CardContent>
		<div class="space-y-1">
			<!-- Media Preview -->
			<div class="bg-muted relative h-32 overflow-hidden rounded-md">
				{#if isScreenshot}
					<img
						src={report.file_path}
						alt={report.title}
						class="h-full w-full object-cover"
						onerror={handleImageError}
					/>
					<!-- Fallback for broken images -->
					{#if isImageError}
						<div class="bg-muted absolute inset-0 flex items-center justify-center">
							<div class="text-muted-foreground flex flex-col items-center space-y-2 text-center">
								<TriangleAlert />
								<p class="text-xs">Image not found</p>
							</div>
						</div>
					{/if}
				{/if}
			</div>

			<!-- Metadata -->
			<div class="text-muted-foreground flex items-center justify-between text-xs">
				<span>{formattedDate}</span>
				<!-- TODO: dedicated report page -->
				<a
					href={report.url}
					target="_blank"
					rel="noopener noreferrer"
					class="text-primary hover:text-primary/80 transition-colors"
				>
					<ExternalLink class="h-4 w-4" />
				</a>
			</div>
		</div>
	</CardContent>
</Card>
