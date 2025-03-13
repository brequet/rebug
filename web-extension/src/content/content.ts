let isSelecting = false;
let startX, startY, endX, endY;
let selectionElement, overlayElement;

console.log('content.js');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === 'startSelection') {
		console.log('[content] startSelection');
		startSelectionProcess();
	}
});

function startSelectionProcess() {
	overlayElement = document.createElement('div');
	overlayElement.className = 'screenshot-overlay';
	document.body.appendChild(overlayElement);

	document.addEventListener('mousedown', handleMouseDown);
	document.addEventListener('mousemove', handleMouseMove);
	document.addEventListener('mouseup', handleMouseUp);

	document.body.style.userSelect = 'none';
}

function handleMouseDown(e) {
	isSelecting = true;
	startX = e.clientX;
	startY = e.clientY;

	selectionElement = document.createElement('div');
	selectionElement.className = 'screenshot-selection';
	document.body.appendChild(selectionElement);

	updateSelectionElement();
}

function handleMouseMove(e) {
	if (!isSelecting) return;

	endX = e.clientX;
	endY = e.clientY;
	updateSelectionElement();
}

function handleMouseUp(e) {
	if (!isSelecting) return;

	isSelecting = false;
	endX = e.clientX;
	endY = e.clientY;

	captureSelectedRegion();

	document.removeEventListener('mousedown', handleMouseDown);
	document.removeEventListener('mousemove', handleMouseMove);
	document.removeEventListener('mouseup', handleMouseUp);

	document.body.style.userSelect = '';
}

function updateSelectionElement() {
	const left = Math.min(startX, endX || startX);
	const top = Math.min(startY, endY || startY);
	const width = Math.abs((endX || startX) - startX);
	const height = Math.abs((endY || startY) - startY);

	selectionElement.style.left = `${left}px`;
	selectionElement.style.top = `${top}px`;
	selectionElement.style.width = `${width}px`;
	selectionElement.style.height = `${height}px`;
}

function captureSelectedRegion() {
	const left = Math.min(startX, endX);
	const top = Math.min(startY, endY);
	const width = Math.abs(endX - startX);
	const height = Math.abs(endY - startY);

	if (width < 5 || height < 5) {
		cleanupSelection();
		return;
	}

	// Store the selection coordinates
	const selectionCoords = { left, top, width, height };

	// Temporarily hide the selection UI
	if (selectionElement) selectionElement.style.display = 'none';
	if (overlayElement) overlayElement.style.display = 'none';

	// Small delay to ensure UI is hidden before capture
	setTimeout(() => {
		chrome.runtime.sendMessage(
			{
				action: 'captureRegion',
				region: selectionCoords
			},
			(response) => {
				// Show UI elements again (in case cleanup hasn't happened yet)
				if (selectionElement) selectionElement.style.display = 'block';
				if (overlayElement) overlayElement.style.display = 'block';

				if (response && response.dataUrl) {
					chrome.runtime.sendMessage({
						action: 'saveScreenshot',
						dataUrl: response.dataUrl
					});
				}
				cleanupSelection();
			}
		);
	}, 50); // Small delay to ensure the UI is hidden
}

function cleanupSelection() {
	if (selectionElement) {
		selectionElement.remove();
		selectionElement = null;
	}

	if (overlayElement) {
		overlayElement.remove();
		overlayElement = null;
	}
}
