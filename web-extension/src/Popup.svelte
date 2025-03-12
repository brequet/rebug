<script>
	function handleFullScreenshot() {
		chrome.runtime.sendMessage({ action: 'takeFullScreenshot' });
		window.close();
	}

	function handleSelectiveScreenshot() {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			chrome.tabs.sendMessage(tabs[0].id, { action: 'startSelection' });
			window.close();
		});
	}
</script>

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
<div class="instructions text-red-400">
	Click for full page or use Select Region to drag and capture a specific area.
</div>
