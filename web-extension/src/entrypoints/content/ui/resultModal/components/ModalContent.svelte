<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardFooter from '$lib/components/ui/card/card-footer.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import { SCREENSHOT_FORMAT } from '$lib/messaging/types';
	import Copy from '@lucide/svelte/icons/copy';
	import CopyCheck from '@lucide/svelte/icons/copy-check';
	import Download from '@lucide/svelte/icons/download';
	import X from '@lucide/svelte/icons/x';
	import { modalStore } from '../modal.store';

	// TODO: sonner toast

	let copyButtonState = $state(false);

	let videoUrl: string | null = $state(null);

	$effect(() => {
		if ($modalStore.props.videoBlob) {
			videoUrl = URL.createObjectURL($modalStore.props.videoBlob);
		}
	});

	onDestroy(() => {
		if (videoUrl) {
			URL.revokeObjectURL(videoUrl);
		}
	});

	function close() {
		modalStore.close();
	}

	const downloadImage = () => {
		if (!$modalStore.props.imageString) return;

		const link = document.createElement('a');
		link.href = $modalStore.props.imageString;
		link.download = `screenshot_${new Date().toISOString().replace(/:/g, '-')}.${SCREENSHOT_FORMAT}`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const downloadVideo = () => {
		if (!videoUrl) return;

		const link = document.createElement('a');
		link.href = videoUrl;
		link.download = `recording_${new Date().toISOString().replace(/:/g, '-')}.webm`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const handleDownload = () => {
		if ($modalStore.props.imageString) {
			downloadImage();
		} else if ($modalStore.props.videoBlob) {
			downloadVideo();
		}
	};

	const copyToClipboard = async () => {
		if (!$modalStore.props.imageString) return;

		try {
			const blob = await fetch($modalStore.props.imageString).then((res) => res.blob());
			await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);

			copyButtonState = true;
			setTimeout(() => {
				copyButtonState = false;
			}, 2000);
		} catch (error) {
			console.error('Failed to copy image to clipboard:', error);
		}
	};
</script>

<Card class="flex max-h-[90vh] max-w-[95vw] flex-col">
	<CardHeader class="flex h-16 shrink-0 flex-row items-center justify-between border-b p-4">
		<h2 class="text-lg font-semibold">Rebug Capture</h2>
		<Button variant="ghost" onclick={close}>
			<X class="size-4" />
		</Button>
	</CardHeader>

	<CardContent class="flex min-h-0 flex-1 p-4">
		{#if $modalStore.props.imageString}
			<img
				src={$modalStore.props.imageString}
				alt="Screenshot preview"
				class="mx-auto max-h-[calc(90vh-160px)] w-auto max-w-full border border-dashed object-contain"
			/>
		{:else if $modalStore.props.videoBlob}
			<div class="flex w-full flex-col items-center">
				<!-- svelte-ignore a11y_media_has_caption -->
				<video
					src={videoUrl}
					controls
					autoplay
					class="max-h-[calc(90vh-160px)] max-w-full border border-dashed"
				>
					Your browser does not support the video tag.
				</video>
			</div>
		{/if}
	</CardContent>

	<CardFooter class="flex h-20 shrink-0 justify-end gap-2 border-t p-4">
		{#if $modalStore.props.imageString}
			<Button onclick={copyToClipboard} variant="outline">
				{#if copyButtonState}
					<CopyCheck class="size-4" />
					Copied!
				{:else}
					<Copy class="size-4" />
					Copy to Clipboard
				{/if}
			</Button>
		{/if}
		<Button onclick={handleDownload}>
			<Download class="size-4" />
			Download {$modalStore.props.videoBlob ? 'Video' : 'Image'}
		</Button>
	</CardFooter>
</Card>
