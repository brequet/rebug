<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import { ResultModalProps } from '$lib/stores/modal.store';
	import Copy from '@lucide/svelte/icons/copy';
	import CopyCheck from '@lucide/svelte/icons/copy-check';
	import Download from '@lucide/svelte/icons/download';
	import X from '@lucide/svelte/icons/x';
	import CardContent from './ui/card/card-content.svelte';
	import CardFooter from './ui/card/card-footer.svelte';
	import CardHeader from './ui/card/card-header.svelte';

	// TODO: sonner toast

	interface Props {
		resultModalProps: ResultModalProps;
		close: () => void;
	}

	let { resultModalProps, close }: Props = $props();

	let copyButtonState = $state(false);

	const downloadImage = () => {
		if (!resultModalProps.imageString) return;

		const link = document.createElement('a');
		link.href = resultModalProps.imageString;
		link.download = `screenshot_${new Date().toISOString().replace(/:/g, '-')}.png`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const copyToClipboard = async () => {
		if (!resultModalProps.imageString) return;

		try {
			const blob = await fetch(resultModalProps.imageString).then((res) => res.blob());
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
		<h2 class="text-lg font-semibold">Screenshot Preview</h2>
		<Button variant="ghost" onclick={close}>
			<X class="size-4" />
		</Button>
	</CardHeader>

	<CardContent class="flex min-h-0 flex-1 p-4">
		{#if resultModalProps.imageString}
			<img
				src={resultModalProps.imageString}
				alt="Screenshot preview"
				class="mx-auto max-h-[calc(90vh-160px)] w-auto max-w-full border border-dashed object-contain"
			/>
		{:else if resultModalProps.videoBlob}
			<div class="flex w-full flex-col items-center">
				<video
					src={URL.createObjectURL(resultModalProps.videoBlob)}
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
		<Button onclick={copyToClipboard} variant="outline">
			{#if copyButtonState}
				<CopyCheck class="size-4" />
				Copied!
			{:else}
				<Copy class="size-4" />
				Copy to Clipboard
			{/if}
		</Button>
		<Button onclick={downloadImage}>
			<Download class="size-4" />
			Download
		</Button>
	</CardFooter>
</Card>
