let isSelecting: boolean = false;
let startX: number, startY: number, endX: number, endY: number;
let selectionElement: HTMLDivElement | null, overlayElement: HTMLDivElement | null;

chrome.runtime.onMessage.addListener(
	(
		message: { action: string },
		sender: chrome.runtime.MessageSender,
		sendResponse: (response?: any) => void
	) => {
		if (message.action === 'startSelection') {
			startSelectionProcess();
		}
	}
);

function startSelectionProcess(): void {
	overlayElement = document.createElement('div');
	overlayElement.className = 'screenshot-overlay';
	document.body.appendChild(overlayElement);

	document.addEventListener('mousedown', handleMouseDown);
	document.addEventListener('mousemove', handleMouseMove);
	document.addEventListener('mouseup', handleMouseUp);

	document.body.style.userSelect = 'none';
}

function handleMouseDown(e: MouseEvent): void {
	isSelecting = true;
	startX = e.clientX;
	startY = e.clientY;

	selectionElement = document.createElement('div');
	selectionElement.className = 'screenshot-selection';
	document.body.appendChild(selectionElement);

	updateSelectionElement();
}

function handleMouseMove(e: MouseEvent): void {
	if (!isSelecting) return;

	endX = e.clientX;
	endY = e.clientY;
	updateSelectionElement();
}

function handleMouseUp(e: MouseEvent): void {
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

function updateSelectionElement(): void {
	const left = Math.min(startX, endX || startX);
	const top = Math.min(startY, endY || startY);
	const width = Math.abs((endX || startX) - startX);
	const height = Math.abs((endY || startY) - startY);

	if (selectionElement) {
		selectionElement.style.left = `${left}px`;
		selectionElement.style.top = `${top}px`;
		selectionElement.style.width = `${width}px`;
		selectionElement.style.height = `${height}px`;
	}
}

function captureSelectedRegion(): void {
	const left = Math.min(startX, endX);
	const top = Math.min(startY, endY);
	const width = Math.abs(endX - startX);
	const height = Math.abs(endY - startY);

	if (width < 5 || height < 5) {
		cleanupSelection();
		return;
	}

	const selectionCoords = { left, top, width, height };

	if (selectionElement) selectionElement.style.display = 'none';
	if (overlayElement) overlayElement.style.display = 'none';

	setTimeout(() => {
		chrome.runtime.sendMessage(
			{
				action: 'captureRegion',
				region: selectionCoords
			},
			(response: { dataUrl: string | ArrayBuffer | null }) => {
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

function cleanupSelection(): void {
	if (selectionElement) {
		selectionElement.remove();
		selectionElement = null;
	}

	if (overlayElement) {
		overlayElement.remove();
		overlayElement = null;
	}
}
