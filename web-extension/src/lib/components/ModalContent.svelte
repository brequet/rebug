<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Card } from '$lib/components/ui/card';
import X from '@lucide/svelte/icons/x';
import CardContent from './ui/card/card-content.svelte';
import CardFooter from './ui/card/card-footer.svelte';
import CardHeader from './ui/card/card-header.svelte';

// TODO: sonner toast

interface Props {
	imageString: string;
	close: () => void;
}

let { imageString, close }: Props = $props();

let copyButtonText = $state('Copy to Clipboard');

const downloadImage = () => {
	if (!imageString) return;

	const link = document.createElement('a');
	link.href = imageString;
	link.download = `screenshot_${new Date().toISOString().replace(/:/g, '-')}.png`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};

const copyToClipboard = async () => {
	if (!imageString) return;

	try {
		const blob = await fetch(imageString).then((res) => res.blob());
		await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);

		copyButtonText = 'Copied!';
		setTimeout(() => {
			copyButtonText = 'Copy to Clipboard';
		}, 2000);
	} catch (error) {
		console.error('Failed to copy image to clipboard:', error);
		copyButtonText = 'Copy Failed';
		setTimeout(() => {
			copyButtonText = 'Copy to Clipboard';
		}, 2000);
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
		{#if imageString}
			<img
				src={imageString}
				alt="Screenshot preview"
				class="mx-auto max-h-[calc(90vh-160px)] w-auto max-w-full border border-dashed object-contain"
			/>
		{/if}
	</CardContent>

	<CardFooter class="flex h-20 shrink-0 justify-end gap-2 border-t p-4">
		<Button onclick={copyToClipboard} variant="outline">
			{copyButtonText}
		</Button>
		<Button onclick={downloadImage}>Download</Button>
	</CardFooter>
</Card>
