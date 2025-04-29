import { CaptureRegionScreenshotMessage, CaptureVisibleTabScreenshotMessage, createErrorResponse, createSuccessResponse, MessageResponse, ResultModalType } from "$lib/messaging/types";
import { blobToBase64 } from "$lib/services/capture";
import { screenshotStorage } from "$lib/services/storage";
import { SCREENSHOT_MIME_TYPE, SelectionArea } from "$lib/types/capture";
import { logger } from "$lib/utils/logger";
import { backgroundMessagingService } from '../services/background-messaging.service';

const log = logger.getLogger('Background:ScreenshotHandler');

export async function handleCaptureVisibleTab(
    message: CaptureVisibleTabScreenshotMessage
): Promise<MessageResponse<{ screenshotDataUrl: string }>> {
    log.info(`Handling ${message.type}`);
    try {
        const dataUrl = await browser.tabs.captureVisibleTab({ format: 'png' });
        await screenshotStorage.setValue(dataUrl); // TODO Needed ?
        await backgroundMessagingService.notifyContentToShowResult(ResultModalType.IMAGE);
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
        const dataUrl = await browser.tabs.captureVisibleTab({ format: 'png' });
        const base64Cropped = await cropImage(dataUrl, region);

        await screenshotStorage.setValue(base64Cropped);
        await backgroundMessagingService.notifyContentToShowResult(ResultModalType.IMAGE); // TODO: maybe not use screenshot storage nor notify, just use response
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

