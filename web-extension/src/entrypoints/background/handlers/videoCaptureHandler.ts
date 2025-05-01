import { createErrorResponse, createSuccessResponse, GetRecordingInProgressMessage, isErrorResponse, MessageResponse, RecordingState, RecordingStoppedDataReadyMessage, ResultModalType, SetupVideoCaptureMessage } from "$lib/messaging/types";
import { logger } from "$lib/utils/logger";
import { PublicPath } from "wxt/browser";
import { backgroundMessagingService } from '../services/background-messaging.service';

const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';

const log = logger.getLogger('Background:VideoCaptureHandler');

export async function handleSetupVideoCapture(message: SetupVideoCaptureMessage): Promise<MessageResponse<void>> {
    log.info(`Handling ${message.type}`, message.payload);

    const { tabId } = message.payload;
    try {
        await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);

        const recordingStartResult = await backgroundMessagingService.requestRecordingStart(tabId)
        if (isErrorResponse(recordingStartResult)) {
            log.error('Failed to start recording:', recordingStartResult.error);
            return createErrorResponse(recordingStartResult.error || 'Failed to start recording');
        }

        await backgroundMessagingService.requestShowRecordingControls(new Date());

        return createSuccessResponse();

    } catch (error) {
        log.error('Error setting up video capture:', error);
        return createErrorResponse((error as Error).message || 'Failed to setup video capture');
    }
}

export async function handleRecordingStoppedDataReady(message: RecordingStoppedDataReadyMessage): Promise<MessageResponse<void>> {
    log.info(`Handling ${message.type}`, message.payload);

    const { videoBlobAsBase64 } = message.payload;
    try {
        backgroundMessagingService.notifyContentToShowResult({
            resultType: ResultModalType.VIDEO,
            base64Video: videoBlobAsBase64
        });

        closeOffscreenDocument().catch(console.error);
        return createSuccessResponse()
    } catch (error) {
        console.error('Error processing recording data:', error);
        return createErrorResponse((error as Error).message || 'Unknown error');
    }
}

export async function handleRecordingInProgress(
    message: GetRecordingInProgressMessage,
    sender: chrome.runtime.MessageSender
): Promise<MessageResponse<RecordingState>> {
    log.info(`Handling ${message.type}`);

    if (!(await hasOffscreenDocument(OFFSCREEN_DOCUMENT_PATH))) {
        log.debug('No offscreen document found. Recording is not in progress.');
        return createSuccessResponse({ inProgress: false })
    }

    const response = await backgroundMessagingService.requestRecordingInProgress();
    if (isErrorResponse(response)) {
        log.error('Failed to get recording in progress status:', response.error);
        return createErrorResponse(response.error || 'Failed to get recording in progress status');
    }

    if (!response.data?.inProgress) {
        return createSuccessResponse({ inProgress: false })
    }

    return createSuccessResponse({
        ...response.data,
        isCurrentTab: sender.tab?.id === response.data.tabId
    })
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
        log.info('Offscreen document already exists. No need to create a new one.');
        return;
    }

    if (creatingOffscreenPromise) {
        log.info('Offscreen document creation in progress. Waiting for it to finish...');
        await creatingOffscreenPromise;
        return;
    }

    log.info('Creating offscreen document...');
    creatingOffscreenPromise = browser.offscreen.createDocument({
        url: path,
        reasons: [browser.offscreen.Reason.DISPLAY_MEDIA],
        justification: 'To record screen/tab/window across navigations.',
    });

    try {
        await creatingOffscreenPromise;
        log.info('Offscreen document created successfully.');
    } catch (error) {
        log.error('Error creating offscreen document:', error);
        throw new Error('Failed to create offscreen document: ' + (error as Error).message);
    } finally {
        creatingOffscreenPromise = null;
    }
}

async function closeOffscreenDocument() {
    if (!(await hasOffscreenDocument(OFFSCREEN_DOCUMENT_PATH))) {
        log.info('No offscreen document found. Nothing to close.');
        return;
    }
    log.info('Closing offscreen document...');
    await browser.offscreen.closeDocument();
    log.info('Offscreen document closed successfully.');
}
