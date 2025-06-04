<script lang="ts">
	import { WEB_APP_LOGIN_URL } from '$lib/auth/auth.config';
	import { AuthService } from '$lib/auth/auth.service';
	import Button from '$lib/components/ui/button/button.svelte';
	import { isCaptureAllowed } from '$lib/messaging/utils/tab-utils';
	import Monitor from '@lucide/svelte/icons/monitor';
	import SquareDashedMousePointer from '@lucide/svelte/icons/square-dashed-mouse-pointer';
	import Video from '@lucide/svelte/icons/video';
	import { popupMessagingService } from './services/popup-messaging.service';

	type PopupActionState = { disabled: false } | { disabled: true; reason: string };

	let popupActionState: PopupActionState = $state({ disabled: false });

	let connectedUser = $state<string | null>(null);

	onMount(() => {
		computePopupActionState();

		AuthService.getCurrentUser()
			.then((user) => {
				connectedUser = user?.email || null;
			})
			.catch((error) => {
				console.error('Error fetching connected user:', error);
				connectedUser = null;
			});
	});

	function computePopupActionState() {
		isCaptureAllowed()
			.then((isAllowed) => {
				if (isAllowed) {
					popupActionState = { disabled: false };
				} else {
					popupActionState = { disabled: true, reason: 'Capture not allowed' };
				}
			})
			.catch((error) => {
				console.error('Error checking capture permission:', error);
				popupActionState = { disabled: true, reason: 'Error checking permission' };
			});
	}

	async function handleFullScreenshot() {
		popupMessagingService
			.requestCaptureVisibleTab()
			.catch((error) => {
				console.error('Error taking full screenshot:', error);
			})
			.finally(() => {
				closePopup();
			});
	}

	async function handleSelectiveScreenshot() {
		popupMessagingService
			.requestStartSelection()
			.catch((error) => {
				console.error('Error taking selective screenshot:', error);
			})
			.finally(() => {
				closePopup();
			});
	}

	async function handleVideoRecording() {
		popupMessagingService
			.requestSetupVideoCapture()
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

	function handleLoginClick(event: MouseEvent) {
		event.preventDefault();

		chrome.tabs.create(
			{
				url: WEB_APP_LOGIN_URL,
				active: true
			},
			(_tab) => {
				if (chrome.runtime.lastError) {
					console.error('Error opening login tab:', chrome.runtime.lastError);
				}
			}
		);

		closePopup();
	}
</script>

<main class="w-100 h-45 flex flex-col gap-2 bg-white p-2">
	<div class="flex w-full flex-row justify-end">
		{#if !connectedUser}
			<a href={WEB_APP_LOGIN_URL} onclick={handleLoginClick} class="text-blue-500 hover:underline">
				Login to Rebug
			</a>
		{:else}
			<span class="right-0 text-gray-700">Connected as: {connectedUser}</span>
		{/if}
	</div>

	<h1 class="pb-2 text-center text-4xl font-bold">Rebug</h1>

	{#if popupActionState.disabled}
		<p class="text-center text-sm text-gray-500">{popupActionState.reason}</p>
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
