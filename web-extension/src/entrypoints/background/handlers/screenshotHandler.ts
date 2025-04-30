import { CaptureRegionScreenshotMessage, CaptureVisibleTabScreenshotMessage, createErrorResponse, createSuccessResponse, MessageResponse, ResultModalType, SCREENSHOT_FORMAT, SCREENSHOT_MIME_TYPE, SelectionArea } from "$lib/messaging/types";
import { blobToBase64 } from "$lib/messaging/utils/blob-utils";
import { logger } from "$lib/utils/logger";
import { backgroundMessagingService } from '../services/background-messaging.service';

const log = logger.getLogger('Background:ScreenshotHandler');

export async function handleCaptureVisibleTab(
    message: CaptureVisibleTabScreenshotMessage
): Promise<MessageResponse<{ screenshotDataUrl: string }>> {
    log.info(`Handling ${message.type}`);
    try {
        const dataUrl = await browser.tabs.captureVisibleTab({ format: SCREENSHOT_FORMAT });
        await backgroundMessagingService.notifyContentToShowResult({
            resultType: ResultModalType.IMAGE,
            base64Image: dataUrl
        });
        return createSuccessResponse({ screenshotDataUrl: dataUrl });
    } catch (error: any) {
        log.error(`Error capturing visible tab: ${error.message}`, error);
        return createErrorResponse(error.message || 'Failed to capture visible tab');
    }
}

export async function handleCaptureRegion(
    message: CaptureRegionScreenshotMessage
): Promise<MessageResponse<{ screenshotDataUrl: string }>> {
    log.info(`Handling ${message.type}`, message.payload);
    const { region } = message.payload;
    try {
        const dataUrl = await browser.tabs.captureVisibleTab({ format: SCREENSHOT_FORMAT });
        const base64Cropped = await cropImage(dataUrl, region);

        await backgroundMessagingService.notifyContentToShowResult({
            resultType: ResultModalType.IMAGE,
            base64Image: base64Cropped
        });
        return createSuccessResponse({ screenshotDataUrl: base64Cropped });
    } catch (error: any) {
        log.error(`Error capturing region: ${error.message}`, error);
        return createErrorResponse(error.message || 'Failed to capture region');
    }
}

async function cropImage(dataUrl: string, region: SelectionArea): Promise<string> {
    log.debug('Cropping image for region:', region);
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
    return await blobToBase64(croppedBlob);
}

