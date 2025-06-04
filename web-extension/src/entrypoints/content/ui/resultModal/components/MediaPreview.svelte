<script lang="ts">
	import { onDestroy } from 'svelte';
	import { ResultModalProps } from '../modalStore.svelte';

	interface Props {
		props: ResultModalProps;
	}

	let { props }: Props = $props();

	let videoUrl: string | null = $state(null);

	$effect(() => {
		if (props.videoBlob) {
			videoUrl = URL.createObjectURL(props.videoBlob);
		}
	});

	onDestroy(() => {
		if (videoUrl) {
			URL.revokeObjectURL(videoUrl);
		}
	});
</script>

<div class="bg-muted/10 flex h-full w-full items-center justify-center p-4">
	{#if props.imageString}
		<img
			src={props.imageString}
			alt="Screenshot preview"
			class="max-h-full max-w-full rounded-lg border border-dashed object-contain shadow-sm"
		/>
	{:else if props.videoBlob && videoUrl}
		<!-- svelte-ignore a11y_media_has_caption -->
		<video
			src={videoUrl}
			controls
			autoplay
			class="max-h-full max-w-full rounded-lg border border-dashed shadow-sm"
		>
			Your browser does not support the video tag.
		</video>
	{:else}
		<div class="text-muted-foreground flex h-full items-center justify-center">
			<p>No media to display</p>
		</div>
	{/if}
</div>
