import { createErrorResponse, createSuccessResponse, GetRecordingInProgressMessage, MessageResponse, RecordingState, StartRecordingRequestMessage, StopRecordingRequestMessage, VIDEO_CAPTURE_MIME_TYPE } from "$lib/messaging/types";
import { blobToBase64 } from "$lib/utils/blob-utils";
import { logger } from "$lib/utils/logger";
import { offscreenMessagingService } from '../services/offscreen-messaging.service';

const log = logger.getLogger('OffscreenScript:VideoCaptureHandler');

let tabId: number | null = null;
let startDate: Date | null = null;
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let recordingStream: MediaStream | null = null;

export async function handleStartRecording(message: StartRecordingRequestMessage): Promise<MessageResponse<void>> {
  log.info(`Handling ${message.type}`, message.payload);
  tabId = message.payload.tabId;

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    log.warn('MediaRecorder is already active. Ignoring start request.');
    return createErrorResponse('MediaRecorder is already active.');
  }

  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    startDate = new Date();
    recordingStream = stream;
    recordedChunks = [];

    mediaRecorder = new MediaRecorder(stream, { mimeType: VIDEO_CAPTURE_MIME_TYPE });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      log.info('MediaRecorder stopped.');
      processRecordedData();
      cleanupStream();
    }

    mediaRecorder.onerror = (event) => {
      log.error('MediaRecorder error:', event.error);
      // TODO: message to the background ?
      stopRecording();
    }

    mediaRecorder.start(100); // Collect data every 100ms

    return createSuccessResponse();
  } catch (error) {
    log.error('Failed to start recording:', error);

    cleanupStream();
    self.close();
    return createErrorResponse(`Failed to start recording: ${(error as Error).message || 'Unknown error'}`);
  }
}

export async function handleStopRecording(message: StopRecordingRequestMessage): Promise<MessageResponse<void>> {
  log.info(`Handling ${message.type}`);

  return stopRecording();
}

export async function handleRecordingInProgress(message: GetRecordingInProgressMessage): Promise<MessageResponse<RecordingState>> {
  log.info(`Handling ${message.type}`);

  if (!startDate || !tabId) {
    log.debug('No recording in progress. Returning inactive state.');
    return createSuccessResponse({ inProgress: false });
  }

  return createSuccessResponse({
    inProgress: true,
    startDate: startDate.toISOString(),
    tabId
  });
}

async function stopRecording(): Promise<MessageResponse<void>> {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') {
    await cleanupStream();
    return createErrorResponse('MediaRecorder is not active or already stopped.');
  }

  log.info('Stopping MediaRecorder...');

  mediaRecorder.stop();

  return createSuccessResponse();
}

async function processRecordedData() {
  if (recordedChunks.length === 0) {
    log.warn('No recorded data available.');
    return;
  }

  log.info(`Processing ${recordedChunks.length} chunks.`);
  const videoBlob = new Blob(recordedChunks, { type: VIDEO_CAPTURE_MIME_TYPE });
  recordedChunks = [];

  await offscreenMessagingService.notifyRecordingStoppedDataReady(await blobToBase64(videoBlob));
}

function cleanupStream() {
  if (recordingStream) {
    log.info('Stopping recording stream...');
    recordingStream.getTracks().forEach(track => track.stop());
    recordingStream = null;
  }
  mediaRecorder = null;
}