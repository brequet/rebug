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
		chrome.tabs.captureVisibleTab({ format: 'png' }, async (dataUrl) => {
			// Convert dataUrl to blob
			const response = await fetch(dataUrl);
			const blob = await response.blob();

			// Create bitmap from blob
			const imageBitmap = await createImageBitmap(blob);

			// Create offscreen canvas
			const canvas = new OffscreenCanvas(message.region.width, message.region.height);
			const ctx = canvas.getContext('2d');
			if (!ctx) {
				throw new Error('Failed to get 2D context');
			}

			// Draw the cropped region
			ctx.drawImage(
				imageBitmap,
				message.region.left,
				message.region.top,
				message.region.width,
				message.region.height,
				0,
				0,
				message.region.width,
				message.region.height
			);

			// Convert to blob and then to dataURL
			const croppedBlob = await canvas.convertToBlob({ type: 'image/png' });
			const reader = new FileReader();
			reader.readAsDataURL(croppedBlob);
			reader.onloadend = () => {
				sendResponse({ dataUrl: reader.result });
			};
		});
		return true; // Indicates async response
	} else if (message.action === 'saveScreenshot') {
		console.log('[background] saveScreenshot');
		chrome.storage.local.set({ screenshot: message.dataUrl }, () => {
			chrome.tabs.create({ url: 'screenshot/screenshot.html' });
		});
	}
});
