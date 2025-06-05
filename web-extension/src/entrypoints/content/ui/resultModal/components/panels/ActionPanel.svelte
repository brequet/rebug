<script lang="ts">
	import type { BoardResponse } from '$lib/board';
	import { Button } from '$lib/components/ui/button';
	import { SCREENSHOT_FORMAT, type SendReportPayload } from '$lib/messaging/types';
	import { blobToBase64 } from '$lib/messaging/utils/blob-utils';
	import type { ReportType } from '$lib/report';
	import { formatPrettyDate } from '$lib/utils/date-utils';
	import CloudUpload from '@lucide/svelte/icons/cloud-upload';
	import Copy from '@lucide/svelte/icons/copy';
	import CopyCheck from '@lucide/svelte/icons/copy-check';
	import Download from '@lucide/svelte/icons/download';
	import { contentScriptMessagingService } from '../../../../services/content-messaging.service';
	import type { ResultModalProps } from '../../modalStore.svelte';
	import UserInfo from '../user/UserInfo.svelte';

	interface Props {
		props: ResultModalProps;
		videoUrl?: string | null;
	}

	let { props, videoUrl }: Props = $props();

	let selectedBoard = $state<BoardResponse | null>(props.boards?.[0] || null);
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

	const handleReportUpload = async () => {
		if (!selectedBoard || !props.user) {
			console.error('No board selected or user not authenticated');
			return;
		}

		const { mediaData, mediaType } = await getMediaData();

		const currentDate = formatPrettyDate(new Date());

		const reportingPayload: SendReportPayload = {
			boardId: selectedBoard.id,
			title: `Report ${currentDate}`, // TODO: customizable
			description: `Report generated on ${currentDate}`,
			// originUrl: , TODO: add origin URL if available
			mediaData: mediaData,
			mediaType
		};

		const sendReportReponse = await contentScriptMessagingService.sendReport(reportingPayload);
		console.log('DEBUUG ICI AUSSI, sendReportReponse:', sendReportReponse);
	};

	const getMediaData = async (): Promise<{
		mediaData: string;
		mediaType: ReportType;
	}> => {
		if (props.imageString) {
			return { mediaData: props.imageString, mediaType: 'Screenshot' };
		} else if (props.videoBlob) {
			return { mediaData: await blobToBase64(props.videoBlob), mediaType: 'Video' };
		} else {
			throw new Error('No media available for reporting');
		}
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
