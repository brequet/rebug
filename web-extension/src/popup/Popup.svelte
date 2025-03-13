<script>
	function handleFullScreenshot() {
		console.log('[pop-up] handleFullScreenshot');
		chrome.runtime.sendMessage({ action: 'takeFullScreenshot' });
		window.close();
	}

	function handleSelectiveScreenshot() {
		console.log('[pop-up] handleSelectiveScreenshot');
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			const activeTabId = tabs[0].id;
			if (!activeTabId) return;

			chrome.tabs.sendMessage(activeTabId, { action: 'startSelection' });
			window.close();
		});
	}
</script>

<div class="flex h-50 w-100 flex-col gap-2 bg-white p-2">
	<button
		class="w-full rounded-md bg-blue-500 p-2 text-white hover:bg-blue-700"
		onclick={handleFullScreenshot}
	>
		Full Page Screenshot
	</button>
	<button
		class="w-full rounded-md bg-blue-500 p-2 text-white hover:bg-blue-700"
		onclick={handleSelectiveScreenshot}
	>
		Select Region
	</button>
	<span> Click for full page or use Select Region to drag and capture a specific area. </span>
</div>
