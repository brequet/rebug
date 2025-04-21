<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { getCurrentTab, isCaptureAllowed } from '$lib/services/capture';
	import { runtimeMessagingService, tabMessagingService } from '$lib/services/messaging';
	import Monitor from '@lucide/svelte/icons/monitor';
	import SquareDashedMousePointer from '@lucide/svelte/icons/square-dashed-mouse-pointer';
	import Video from '@lucide/svelte/icons/video';

	let isCaptureDisabled = $state(false);

	onMount(async () => {
		isCaptureDisabled = !(await isCaptureAllowed());
	});

	async function handleFullScreenshot() {
		runtimeMessagingService
			.initiateFullScreenshot()
			.catch((error) => {
				console.error('Error taking full screenshot:', error);
			})
			.finally(() => {
				closePopup();
			});
	}

	async function handleSelectiveScreenshot() {
		tabMessagingService
			.initiateSelectiveScreenshot()
			.catch((error) => {
				console.error('Error taking selective screenshot:', error);
			})
			.finally(() => {
				closePopup();
			});
	}

	async function handleVideoRecording() {
		const currentTab = await getCurrentTab();
		if (!currentTab?.id) {
			console.error('No active tab found');
			return;
		}

		runtimeMessagingService
			.setupVideoCapture(currentTab.id)
			.catch((error) => {
				console.error('Error starting video capture:', error);
			})
			.finally(() => {
				closePopup();
			});
	}

	function closePopup() {
		window.close();
	}

	function isResultModalOpened(): boolean {
		// TODO: implement isResultModalOpened
		return false;
	}
</script>

<main class="h-50 w-100 flex flex-col gap-2 bg-white p-2">
	<h1 class="pb-2 text-center text-4xl font-bold">Rebug</h1>

	{#if isCaptureDisabled}
		<p class="text-center text-sm text-gray-500">To use Rebug, please begin browsing websites</p>
	{:else if isResultModalOpened()}
		<p class="text-center text-sm text-gray-500">A capture is already in progress</p>
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

		<Button onclick={handleVideoRecording}>
			<Video class="mr-2 size-4" />
			Record
		</Button>
	{/if}
</main>
