import { runtimeMessagingService, tabMessagingService } from "$lib/services/messaging";
import { createErrorResponse, createSuccessResponse, MessageProcessingResponse } from "$lib/types/messaging/base";
import { RecordingStoppedDataReadyMessage } from "$lib/types/messaging/runtime";
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

        // return new Promise((resolve, reject) => {
        //     browser.desktopCapture.chooseDesktopMedia(
        //         ['screen', 'window', 'tab'],
        //         activeTab,
        //         async (streamId, options) => {
        //             if (browser.runtime.lastError) {
        //                 console.error('Error in chooseDesktopMedia:', browser.runtime.lastError.message);
        //                 reject(createErrorResponse(`Capture cancelled or failed: ${browser.runtime.lastError.message}`));
        //                 return;
        //             }

        //             if (!streamId) {
        //                 console.error('Permission denied or no stream ID received.');
        //                 reject(createErrorResponse('Permission denied or no stream selected.'));
        //                 return;
        //             }

        //             console.log(`Background: Stream ID ${streamId} obtained. Options:`, options);

        //             await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);

        //             runtimeMessagingService.startVideoCapture(streamId);

        // Send the streamId to the offscreen document to start recording
        // browser.runtime.sendMessage({
        //     type: 'start-recording',
        //     target: 'offscreen',
        //     data: {
        //         streamId,
        //         // Determine if audio should be recorded based on options
        //         // Note: getDisplayMedia might be better if you need fine-grained audio control
        //         recordAudio: options?.canRequestAudioTrack ?? false
        //     }
        // }, (response) => {
        //      if (browser.runtime.lastError) {
        //         console.error("Error sending start message:", browser.runtime.lastError.message);
        //         reject(createErrorResponse(`Failed to communicate with offscreen document: ${browser.runtime.lastError.message}`));
        //      } else if (response?.success) {
        //          console.log("Background: Start recording message acknowledged by offscreen.");
        //          resolve(createSuccessResponse()); 
        //      } else {
        //          console.error("Background: Offscreen document failed to start recording.", response?.error);
        //          reject(createErrorResponse(`Offscreen document error: ${response?.error || 'Unknown error'}`));
        //      }
        // });
        //         }
        //     );
        //     // Note: chooseDesktopMedia itself doesn't return a request ID you can cancel easily here.
        //     // Cancellation happens via the user closing the picker dialog.
        // });

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
