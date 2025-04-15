import { modalStore } from "$lib/stores/modal.store";
import { VIDEO_CAPTURE_MIME_TYPE } from "$lib/types/capture";
import { ContentScriptContext } from "wxt/client";
import { closeRecordingControlsOverlay, openRecordingControlsOverlay } from "../ui/recordingControls";

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let recordingStream: MediaStream | null = null;

export async function startRecording(ctx: ContentScriptContext, streamId: string): Promise<boolean> {
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

export async function stopRecordingAndSendData() {
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

        const blobToSend = videoBlob; // Create a reference before resetting
        recordedChunks = [];
        mediaRecorder = null;

        // Then open the modal with the saved reference
        modalStore.open({ videoBlob: blobToSend });
    }
}