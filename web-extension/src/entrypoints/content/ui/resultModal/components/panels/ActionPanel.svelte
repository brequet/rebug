<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { SCREENSHOT_FORMAT } from '$lib/messaging/types';
	import CloudUpload from '@lucide/svelte/icons/cloud-upload';
	import Copy from '@lucide/svelte/icons/copy';
	import CopyCheck from '@lucide/svelte/icons/copy-check';
	import Download from '@lucide/svelte/icons/download';
	import type { ResultModalProps } from '../../modalStore.svelte';
	import UserInfo from '../user/UserInfo.svelte';

	interface Props {
		props: ResultModalProps;
		videoUrl?: string | null;
	}

	let { props, videoUrl }: Props = $props();

	let copyButtonState = $state(false);

	const downloadImage = () => {
		if (!props.imageString) return;

		const link = document.createElement('a');
		link.href = props.imageString;
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
		if (props.imageString) {
			downloadImage();
		} else if (props.videoBlob) {
			downloadVideo();
		}
	};

	const handleReportUpload = () => {
		// TODO: Implement report upload functionality
	};

	const copyToClipboard = async () => {
		if (!props.imageString) return;

		try {
			const blob = await fetch(props.imageString).then((res) => res.blob());
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

<div class="bg-background flex h-full w-80 flex-col border-l">
	<UserInfo user={props.user} />
	<!-- TODO: add a comment section -->
	<!-- <CommentsSection /> -->

	<div class="flex flex-1 flex-col overflow-y-auto"></div>

	<div class="border-t p-4">
		<div class="flex flex-col gap-2">
			{#if props.imageString}
				<Button onclick={copyToClipboard} variant="outline" class="w-full">
					{#if copyButtonState}
						<CopyCheck class="size-4" />
						Copied!
					{:else}
						<Copy class="size-4" />
						Copy to Clipboard
					{/if}
				</Button>
			{/if}
			<Button onclick={handleDownload} class="w-full">
				<Download class="size-4" />
				Download {props.videoBlob ? 'Video' : 'Image'}
			</Button>
			<Button onclick={handleReportUpload} class="w-full" disabled={props.user == undefined}>
				<CloudUpload class="size-4" />
				Share report
			</Button>
		</div>
	</div>
</div>
