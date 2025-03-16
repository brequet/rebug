<script>
	import { onMount } from 'svelte';

	let screenshotSrc = $state('');
	let copyButtonText = $state('Copy to Clipboard');

	onMount(() => {
		chrome.storage.local.get('screenshot', (data) => {
			if (data.screenshot) {
				screenshotSrc = data.screenshot;
			}
		});
	});

	function downloadScreenshot() {
		const a = document.createElement('a');
		a.href = screenshotSrc;
		a.download = `screenshot_${new Date().toISOString().replace(/:/g, '-')}.png`;
		a.click();
	}

	async function copyToClipboard() {
		try {
			const response = await fetch(screenshotSrc);
			const blob = await response.blob();
			await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
			copyButtonText = 'Copied!';
			setTimeout(() => {
				copyButtonText = 'Copy to Clipboard';
			}, 2000);
		} catch (err) {
			console.error('Failed to copy: ', err);
		}
	}
</script>

<div class="fixed top-0 left-0 z-1000000 flex h-screen w-full flex-col bg-gray-100 p-4">
	<h2 class="p-2 text-center text-xl font-bold text-gray-800">Screenshot Preview</h2>
	<div class="flex flex-1 flex-col items-center justify-between overflow-hidden px-4 pb-4">
		<div
			class="relative my-auto flex items-center justify-center overflow-hidden rounded bg-white p-2.5 shadow-md"
		>
			<img src={screenshotSrc} alt="Screenshot" class="max-h-full w-auto object-contain" />
		</div>
		<div class="mt-4 flex gap-2.5">
			<button
				onclick={downloadScreenshot}
				class="cursor-pointer rounded border-none bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-700"
			>
				Download
			</button>
			<button
				onclick={copyToClipboard}
				class="cursor-pointer rounded border-none bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-700"
			>
				{copyButtonText}
			</button>
		</div>
	</div>
</div>
