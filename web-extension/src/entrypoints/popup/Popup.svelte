<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { isCaptureAllowed } from '$lib/services/capture';
	import {
		initiateFullScreenshot,
		initiateSelectiveScreenshot,
		initiateVideoRecording
	} from '$lib/services/messaging';
	import Monitor from '@lucide/svelte/icons/monitor';
	import SquareDashedMousePointer from '@lucide/svelte/icons/square-dashed-mouse-pointer';
	import Video from '@lucide/svelte/icons/video';

	let isCaptureDisabled = $state(false);

	onMount(async () => {
		isCaptureDisabled = !(await isCaptureAllowed());
	});

	async function handleFullScreenshot() {
		try {
			const response = await initiateFullScreenshot();
			console.log('Response from background:', response);
		} catch (error) {
			console.error('Error taking full screenshot:', error);
		} finally {
			closePopup();
		}
	}

	async function handleSelectiveScreenshot() {
		try {
			const response = await initiateSelectiveScreenshot();
			console.log('Response from background:', response);
		} catch (error) {
			console.error('Error taking selective screenshot:', error);
		} finally {
			closePopup();
		}
	}

	async function handleTabRecording() {
		try {
			const response = await initiateVideoRecording();
			console.log('Response from background:', response);
		} catch (error) {
			console.error('Error starting video capture:', error);
		}
	}

	function closePopup() {
		// window.close();
	}
</script>

<main class="h-50 w-100 flex flex-col gap-2 bg-white p-2">
	<h1 class="pb-2 text-center text-4xl font-bold">Rebug</h1>

	{#if isCaptureDisabled}
		<p class="text-center text-sm text-gray-500">To use Rebug, please begin browsing websites</p>
	{:else}
		<div class="[&>*]:flex-1/2 flex flex-row gap-1">
			<Button onclick={handleFullScreenshot}>
				<Monitor class="mr-2 size-4" />
				Full Page Screenshot
			</Button>
			<Button onclick={handleSelectiveScreenshot}>
				<SquareDashedMousePointer class="mr-2 size-4" />
				Select Region
			</Button>
		</div>

		<Button onclick={handleTabRecording}>
			<Video class="mr-2 size-4" />
			Record
		</Button>
	{/if}
</main>
