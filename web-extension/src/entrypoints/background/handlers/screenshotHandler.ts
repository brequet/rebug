import { blobToBase64 } from "$lib/services/capture";
import { tabMessagingService } from "$lib/services/messaging";
import { screenshot } from "$lib/services/storage";
import { SCREENSHOT_FORMAT, SCREENSHOT_MIME_TYPE, SelectionArea } from "$lib/types/capture";
import { createErrorResponse, createSuccessResponse, MessageProcessingResponse } from "$lib/types/messaging/base";
import { ResultModalType } from "$lib/types/messaging/tab";

export async function handleFullScreenshot(): Promise<MessageProcessingResponse> {
    console.log('Taking full screenshot...');
    try {
        const dataUrl = await browser.tabs.captureVisibleTab({ format: SCREENSHOT_FORMAT });
        await screenshot.setValue(dataUrl);
        await tabMessagingService.showResultModal(ResultModalType.IMAGE);
        return createSuccessResponse();
    } catch (error) {
        return createErrorResponse((error as Error).message || 'Unknown error');
    }
}

export async function handleRegionScreenshot(region: SelectionArea): Promise<MessageProcessingResponse> {
    console.log('Taking region screenshot...', { region });
    try {
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
        await tabMessagingService.showResultModal(ResultModalType.IMAGE);
        return createSuccessResponse();
    } catch (error) {
        return createErrorResponse((error as Error).message || 'Unknown error');
    }
}
