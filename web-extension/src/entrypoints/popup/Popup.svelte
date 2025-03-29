<script lang="ts">
import Button from '$lib/components/ui/button/button.svelte';
import { initiateFullScreenshot, initiateSelectiveScreenshot } from '$lib/services/messaging';
import { isScreenshotAllowed } from '$lib/services/screenshot';
import Monitor from '@lucide/svelte/icons/monitor';
import SquareDashedMousePointer from '@lucide/svelte/icons/square-dashed-mouse-pointer';

let isScreenshotDisabled = $state(false);

onMount(async () => {
	isScreenshotDisabled = !(await isScreenshotAllowed());
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

function closePopup() {
	window.close();
}
</script>

<main class="h-50 w-100 flex flex-col gap-2 bg-white p-2">
	<h1 class="text-primary pb-2 text-center text-4xl font-bold">Rebug</h1>

	<div class="[&>*]:flex-1/2 flex flex-row gap-1">
		<Button onclick={handleFullScreenshot} disabled={isScreenshotDisabled}>
			<Monitor class="mr-2 size-4" />
			Full Page Screenshot
		</Button>
		<Button onclick={handleSelectiveScreenshot} disabled={isScreenshotDisabled}>
			<SquareDashedMousePointer class="mr-2 size-4" />
			Select Region
		</Button>
	</div>

	{#if isScreenshotDisabled}
		<p class="text-center text-sm text-red-500">Screenshots disabled on this page</p>
	{/if}
</main>
