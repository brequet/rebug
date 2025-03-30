import ScreenshotOverlay from "$lib/components/ScreenshotOverlay.svelte";
import { initiateRegionScreenshot } from "$lib/services/messaging";
import { modalStore } from "$lib/stores/modal.store";
import { SelectionArea, VIDEO_CAPTURE_MIME_TYPE } from "$lib/types/capture";
import { ResultModalType, TabMessage, TabMessageType } from "$lib/types/messages";
import { mount } from "svelte";
import { ContentScriptContext, ShadowRootContentScriptUi } from "wxt/client";
import { closeRecordingControlsOverlay, openRecordingControlsOverlay } from "./recordingControlsOverlay";
import { openRebugResultModal } from "./resultModal";

export function initializeMessageListener(ctx: ContentScriptContext) {
    browser.runtime.onMessage.addListener(async (message: TabMessage, _sender, sendResponse) => {
        console.log('Received message:', message);

        handleMessage(ctx, message)
            .then(result => sendResponse({ success: result }))
            .catch(error => {
                console.error('Error handling message:', error);
                sendResponse({ success: false, error: error.message });
            });

        return true;
    });
}

async function handleMessage(ctx: ContentScriptContext, message: TabMessage): Promise<boolean> {
    switch (message.type) {
        case TabMessageType.SHOW_RESULT_MODAL:
            return handleShowResultModal(message.resultModalType);
        case TabMessageType.START_SELECTION:
            return handleStartScreenshotSelection(ctx);
        case TabMessageType.STREAM_ID_RECEIVED:
            return startRecording(ctx, message.streamId);
        // case TabMessageType.SHOW_RECORDING_CONTROLS:
        //     return handleShowRecordingControlsOverlay(ctx);
        default:
            console.warn(`Unknown message type: ${(message as any).type}`);
            return false;
    }
}

async function handleShowResultModal(resultModalType: ResultModalType): Promise<boolean> {
    console.log('Showing result modal...');
    try {
        openRebugResultModal(resultModalType);
        return true
    } catch (error) {
        console.error('Error opening result modal:', error);
        return false;
    }
}

async function handleStartScreenshotSelection(ctx: ContentScriptContext): Promise<boolean> {
    console.log('Starting screenshot selection...');

    return new Promise<SelectionArea>((resolve, reject) => {
        let ui: ShadowRootContentScriptUi<{}>;

        const onComplete = (selectionArea: SelectionArea) => {
            ui.remove();
            resolve(selectionArea);
        };

        const onCancel = () => {
            ui.remove();
            reject(new Error('Screenshot selection cancelled'));
        };

        // TODO dedicated TS file and move to content/components
        createShadowRootUi(ctx, {
            name: 'rebug-screenshot-overlay-ui',
            position: 'inline',
            anchor: 'body',
            onMount: (container) => {
                return mount(ScreenshotOverlay, {
                    target: container,
                    props: { onComplete, onCancel }
                });
            },
        }).then(createdUi => {
            ui = createdUi;
            ui.mount();
        });
    }).then(async (selectionArea) => {
        console.log('Screenshot selection area:', selectionArea);
        await initiateRegionScreenshot(selectionArea)
        return true;
    }
    ).catch((error) => {
        console.error('Error during screenshot selection:', error);
        throw error;
    });
}

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let recordingStream: MediaStream | null = null;

async function startRecording(ctx: ContentScriptContext, streamId: string): Promise<boolean> {
    console.log('Starting tab recording...');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: streamId,
                    maxWidth: screen.width,
                    maxHeight: screen.height
                }
            }
        });

        recordingStream = stream;

        // Create recording controls UI
        openRecordingControlsOverlay(ctx, stopRecordingAndSendData);

        // Start recording
        mediaRecorder = new MediaRecorder(stream, { mimeType: VIDEO_CAPTURE_MIME_TYPE });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            // Clean up
            stopRecordingAndSendData();
        };

        // Start the recorder
        mediaRecorder.start(100); // Collect data every 100ms

        return true;
    } catch (error) {
        console.error("Error starting tab capture:", error);
        return false;
    }
}

function stopRecordingAndSendData() {
    console.log('Stopping recording...');

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();

        // Stop all tracks in the stream
        if (recordingStream) {
            recordingStream.getTracks().forEach(track => track.stop());
            recordingStream = null;
        }

        // Remove recording controls
        closeRecordingControlsOverlay();

        const videoBlob = new Blob(recordedChunks, { type: VIDEO_CAPTURE_MIME_TYPE });

        modalStore.open({ videoBlob });

        // Reset recording state
        recordedChunks = [];
        mediaRecorder = null;
    }
}