import { blobToBase64 } from "$lib/services/capture";
import { runtimeMessagingService } from "$lib/services/messaging";
import { VIDEO_CAPTURE_MIME_TYPE } from "$lib/types/capture";
import { createErrorResponse, createSuccessResponse, MessageProcessingResponse } from "$lib/types/messaging/base";
import { GetRecordingStartDateMessageResponse } from "$lib/types/messaging/runtime";

let startDate: Date | null = null;
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let recordingStream: MediaStream | null = null;

export async function startRecording(): Promise<MessageProcessingResponse> {
  console.log('Offscreen: Starting recording');

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    console.warn('Offscreen: Recording is already in progress.');
    return createErrorResponse("Recording already active.");
  }


  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    console.log('Offscreen: Requesting user media...');

    recordingStream = stream;
    recordedChunks = [];

    startDate = new Date();

    console.log('Offscreen: Creating MediaRecorder...');
    mediaRecorder = new MediaRecorder(stream, { mimeType: VIDEO_CAPTURE_MIME_TYPE });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      console.log('Offscreen: MediaRecorder stopped.');
      processRecordedData();
      cleanupStream();
    }

    mediaRecorder.onerror = (event) => {
      console.error('Offscreen: MediaRecorder error:', event);
      // TODO: message to the background
      stopRecording();
    }


    mediaRecorder.start(100); // Collect data every 100ms

    // tabMessagingService.showRecordingControls(startDate);

    console.log('Offscreen: MediaRecorder started.');
    return createSuccessResponse();
  } catch (error) {
    console.error("Error starting recording in offscreen document:", error);
    // TODO: message to the background

    cleanupStream();
    self.close();
    return createErrorResponse(`Failed to start recording: ${(error as Error).message || 'Unknown error'}`);
  }
}

export async function stopRecording(): Promise<MessageProcessingResponse> {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') {
    cleanupStream();
    return createErrorResponse('MediaRecorder is not active or already stopped.');
  }

  console.log('Offscreen: Stopping MediaRecorder...');

  mediaRecorder.stop();

  return createSuccessResponse();
}

export async function getRecordingStartDate(): Promise<GetRecordingStartDateMessageResponse> {
  if (!startDate) {
    console.log('Offscreen: No recording in progress.');
    return createSuccessResponse({ recordStartDate: null });
  }

  console.log('Offscreen: Recording in progress:', startDate);
  return createSuccessResponse({ recordStartDate: startDate.toISOString() });
}

async function processRecordedData() {
  if (recordedChunks.length === 0) {
    console.warn("Offscreen: No data recorded.");
    return;
  }

  console.log(`Offscreen: Processing ${recordedChunks.length} chunks.`);
  const videoBlob = new Blob(recordedChunks, { type: VIDEO_CAPTURE_MIME_TYPE });
  recordedChunks = [];

  runtimeMessagingService.recordingStoppedDataReady(await blobToBase64(videoBlob));
}

function cleanupStream() {
  if (recordingStream) {
    console.log('Offscreen: Stopping stream tracks.');
    recordingStream.getTracks().forEach(track => track.stop());
    recordingStream = null;
  }
  mediaRecorder = null;
}