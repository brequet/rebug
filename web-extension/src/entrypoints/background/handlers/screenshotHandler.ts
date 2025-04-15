import { blobToBase64 } from "$lib/services/capture";
import { showResultModal } from "$lib/services/messaging";
import { screenshot } from "$lib/services/storage";
import { SCREENSHOT_FORMAT, SCREENSHOT_MIME_TYPE, SelectionArea } from "$lib/types/capture";
import { MessageProcessingResponse, ResultModalType } from "$lib/types/messages";

export async function handleFullScreenshot(): Promise<MessageProcessingResponse> {
    console.log('Taking full screenshot...');
    try {
        const dataUrl = await browser.tabs.captureVisibleTab({ format: SCREENSHOT_FORMAT });
        await screenshot.setValue(dataUrl);
        await showResultModal(ResultModalType.IMAGE);
        return { success: true };
    } catch (error) {
        const errorMessage = (error as Error).message || 'Unknown error';
        console.error('Error taking screenshot:', errorMessage);

        return { success: false, error: errorMessage };
    }
}

export async function handleRegionScreenshot(region: SelectionArea): Promise<MessageProcessingResponse> {
    console.log('Taking region screenshot...', { region });
    try {
        // TODO: get active tab id from sender at messages listener
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        if (!activeTab?.id) {
            throw new Error('No active tab found');
        }

        const dataUrl = await browser.tabs.captureVisibleTab({ format: SCREENSHOT_FORMAT });
        const response = await fetch(dataUrl);
        const blob = await response.blob();

        const imageBitmap = await createImageBitmap(blob);

        // Create offscreen canvas - adjust for device pixel ratio
        const canvas = new OffscreenCanvas(region.width, region.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get 2D context');
        }

        const scaledRegion = {
            left: region.x * region.devicePixelRatio,
            top: region.y * region.devicePixelRatio,
            width: region.width * region.devicePixelRatio,
            height: region.height * region.devicePixelRatio
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
            region.width,
            region.height
        );

        const croppedBlob = await canvas.convertToBlob({ type: SCREENSHOT_MIME_TYPE });
        const croppedDataUrl = await blobToBase64(croppedBlob);

        await screenshot.setValue(croppedDataUrl);
        await showResultModal(ResultModalType.IMAGE);
        return { success: true };
    } catch (error) {
        const errorMessage = (error as Error).message || 'Unknown error';

        console.error('Error taking region screenshot:', errorMessage);

        return { success: false, error: errorMessage };
    }
}
