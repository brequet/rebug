<script lang="ts">
	import type { ReportResponse } from '$lib/types/generated/ReportResponse';
	import { TriangleAlert } from '@lucide/svelte';

	let { report }: { report: ReportResponse } = $props();

	const isScreenshot = $derived(report.report_type === 'Screenshot');
	const isVideo = $derived(report.report_type === 'Video');

	let isImageError = $state(false);
</script>

<div class="shadow">
	{#if isScreenshot}
		{#if isImageError}
			<div class="text-muted-foreground flex flex-col items-center gap-4">
				<TriangleAlert class="size-12" />
				<span class="text-lg">Image could not be loaded.</span>
			</div>
		{:else}
			<img
				src={report.file_path}
				alt="Report: {report.title}"
				class="size-full object-contain"
				onerror={() => (isImageError = true)}
			/>
		{/if}
	{:else if isVideo}
		<video src={report.file_path} controls class="size-full object-contain"></video>
	{:else}
		<div class="text-muted-foreground flex flex-col items-center gap-4">
			<TriangleAlert class="size-12" />
			<span class="text-lg">Unsupported report type</span>
		</div>
	{/if}
</div>
