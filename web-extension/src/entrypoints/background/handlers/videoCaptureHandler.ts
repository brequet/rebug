import { runtimeMessagingService, tabMessagingService } from "$lib/services/messaging";
import { createErrorResponse, createSuccessResponse, MessageProcessingResponse } from "$lib/types/messaging/base";
import { IsRecordingInProgressMessageResponse, RecordingStoppedDataReadyMessage } from "$lib/types/messaging/runtime";
import { ResultModalType } from "$lib/types/messaging/tab";
import { PublicPath } from "wxt/browser";

const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';

let activeTabId: number | null = null;

export async function handleSetupVideoCapture(tabId: number): Promise<MessageProcessingResponse> {
    console.log('Background: Initiating video capture...');

    try {
        await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);

        activeTabId = tabId; // Store the tab ID for later use
        await runtimeMessagingService.startVideoCapture();

        await tabMessagingService.showRecordingControls(new Date());

        return createSuccessResponse();

    } catch (error) {
        const errorMessage = (error as Error).message || 'Unknown error';
        console.error('Error initiating video capture:', errorMessage);
        return createErrorResponse(errorMessage);
    }
}

export async function handleRecordingStoppedDataReady(message: RecordingStoppedDataReadyMessage): Promise<MessageProcessingResponse> {
    console.log('Background: Recording stopped, data ready.');
    try {
        tabMessagingService.showResultModal(ResultModalType.VIDEO, message.videoBlobAsBase64);

        closeOffscreenDocument().catch(console.error);
        return createSuccessResponse()
    } catch (error) {
        console.error('Error processing recording data:', error);
        return createErrorResponse((error as Error).message || 'Unknown error');
    }
}

export async function isRecordingInProgress(): Promise<IsRecordingInProgressMessageResponse> {
    if (!(await hasOffscreenDocument(OFFSCREEN_DOCUMENT_PATH))) {
        console.log('No offscreen document found. Recording is not in progress.');
        return createSuccessResponse({ inProgress: false });
    }

    const recordingStartDate = (await runtimeMessagingService.getRecordingStartDate()).data?.recordStartDate

    console.log('Is recording in progress:', recordingStartDate);
    return createSuccessResponse({ inProgress: true, recordStartDate: recordingStartDate || undefined });
}

async function hasOffscreenDocument(path: PublicPath): Promise<boolean> {
    const offscreenUrl = browser.runtime.getURL(path);
    const existingContexts = await browser.runtime.getContexts({
        contextTypes: [browser.runtime.ContextType.OFFSCREEN_DOCUMENT],
        documentUrls: [offscreenUrl]
    });
    return existingContexts.length > 0;
}

let creatingOffscreenPromise: Promise<void> | null = null;

async function setupOffscreenDocument(path: PublicPath): Promise<void> {
    if (await hasOffscreenDocument(path)) {
        console.log('Offscreen document already exists.');
        return;
    }

    if (creatingOffscreenPromise) {
        console.log('Offscreen document creation already in progress.');
        await creatingOffscreenPromise;
        return;
    }

    console.log('Creating offscreen document...');
    creatingOffscreenPromise = browser.offscreen.createDocument({
        url: path,
        reasons: [browser.offscreen.Reason.DISPLAY_MEDIA],
        justification: 'To record screen/tab/window across navigations.',
    });

    try {
        await creatingOffscreenPromise;
        console.log('Offscreen document created successfully.');
    } catch (error) {
        console.error('Error creating offscreen document:', error);
    } finally {
        creatingOffscreenPromise = null;
    }
}

async function closeOffscreenDocument() {
    if (!(await hasOffscreenDocument(OFFSCREEN_DOCUMENT_PATH))) {
        console.log('No offscreen document to close.');
        return;
    }
    console.log('Closing offscreen document...');
    await browser.offscreen.closeDocument();
    console.log('Offscreen document closed.');
}
