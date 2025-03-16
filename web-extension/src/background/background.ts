import { Message } from '../lib/types/message';

chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
	if (message.action === 'takeFullScreenshot') {
		console.log('[background] takeFullScreenshot');
		chrome.tabs.captureVisibleTab({ format: 'png' }, (dataUrl) => {
			chrome.storage.local.set({ screenshot: dataUrl }, () => {
				chrome.tabs.create({ url: 'screenshot/screenshot.html' });
			});
		});
	} else if (message.action === 'captureRegion') {
		console.log('[background] captureRegion');

		chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
			const activeTab = tabs[0];
			if (!activeTab || !activeTab.id) {
				throw new Error('Failed to get active tab');
			}

			// Execute script to get device pixel ratio (important for high-DPI displays)
			const results = await chrome.scripting.executeScript({
				target: { tabId: activeTab.id },
				func: () => window.devicePixelRatio
			});

			const devicePixelRatio = results[0].result || 1;
			console.log('Device pixel ratio:', devicePixelRatio);

			chrome.tabs.captureVisibleTab({ format: 'png' }, async (dataUrl) => {
				const response = await fetch(dataUrl);
				const blob = await response.blob();

				const imageBitmap = await createImageBitmap(blob);

				// Create offscreen canvas - adjust for device pixel ratio
				const canvas = new OffscreenCanvas(message.region.width, message.region.height);
				const ctx = canvas.getContext('2d');
				if (!ctx) {
					throw new Error('Failed to get 2D context');
				}

				const scaledRegion = {
					left: message.region.left * devicePixelRatio,
					top: message.region.top * devicePixelRatio,
					width: message.region.width * devicePixelRatio,
					height: message.region.height * devicePixelRatio
				};

				console.log('captureRegion (scaled):', scaledRegion);

				ctx.drawImage(
					imageBitmap,
					scaledRegion.left,
					scaledRegion.top,
					scaledRegion.width,
					scaledRegion.height,
					0,
					0,
					message.region.width,
					message.region.height
				);

				const croppedBlob = await canvas.convertToBlob({ type: 'image/png' });
				const reader = new FileReader();
				reader.readAsDataURL(croppedBlob);
				reader.onloadend = () => {
					sendResponse({ dataUrl: reader.result });
				};
			});
		});

		return true; // Indicates async response
	} else if (message.action === 'saveScreenshot') {
		console.log('[background] saveScreenshot');
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (!tabs[0].id) {
				throw new Error('Failed to get active tab');
			}

			chrome.tabs.sendMessage(tabs[0].id, {
				action: 'showScreenshotModal',
				dataUrl: message.dataUrl
			});
		});
	}
});
