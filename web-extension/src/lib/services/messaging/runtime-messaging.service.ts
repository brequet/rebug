import { SelectionArea } from "$lib/types/capture";
import { MessageProcessingResponse } from "$lib/types/messaging/base";
import { RuntimeMessage, RuntimeMessages } from "$lib/types/messaging/runtime";
import { BaseMessagingService } from "./base-messaging.service";

export class RuntimeMessagingService extends BaseMessagingService {
    /**
     * Sends a message to the background script
     */
    private sendRuntimeMessage(message: RuntimeMessage): Promise<MessageProcessingResponse> {
        try {
            console.debug(`Sending runtime message:`, message.type);
            return browser.runtime.sendMessage(message);
        } catch (error) {
            return this.handleError('sending runtime message', error);
        }
    }

    /**
     * Initiates full page screenshot by sending message to background
     */
    initiateFullScreenshot(): Promise<MessageProcessingResponse> {
        return this.sendRuntimeMessage(RuntimeMessages.takeFullScreenshot());
    }

    /**
     * Initiates region screenshot by sending message to background
     */
    initiateRegionScreenshot(region: SelectionArea): Promise<MessageProcessingResponse> {
        return this.sendRuntimeMessage(RuntimeMessages.takeRegionScreenshot(region));
    }

    /**
     * Initiates video recording
     */
    setupVideoCapture(tabId: number): Promise<MessageProcessingResponse> {
        try {
            return this.sendRuntimeMessage(RuntimeMessages.setupVideoCapture(tabId));
        } catch (error) {
            return this.handleError('starting tab capture', error);
        }
    }

    /**
     * Starts video recording
     */
    startVideoCapture(): Promise<MessageProcessingResponse> {
        try {
            return this.sendRuntimeMessage(RuntimeMessages.startVideoCapture());
        } catch (error) {
            return this.handleError('starting tab capture', error);
        }
    }

    /**
     * Stops video recording
     */
    stopVideoCapture(): Promise<MessageProcessingResponse> {
        try {
            return this.sendRuntimeMessage(RuntimeMessages.stopVideoCapture());
        } catch (error) {
            return this.handleError('stopping tab capture', error);
        }
    }

    /**
     * Notifies that the recording has stopped and data is ready
     */
    recordingStoppedDataReady(videoBlobAsBase64: string): Promise<MessageProcessingResponse> {
        try {
            return this.sendRuntimeMessage(RuntimeMessages.recordingStoppedDataReady(videoBlobAsBase64));
        } catch (error) {
            return this.handleError('notifying recording stopped', error);
        }
    }
}

export const runtimeMessagingService = new RuntimeMessagingService();
