import { SelectionArea } from "$lib/types/capture";
import { ResultModalType, RuntimeMessage, RuntimeMessages, TabMessage, TabMessages } from "$lib/types/messages";

/**
 * Sends a message to the active tab's content script
 */
export async function sendMessageToActiveTab(message: TabMessage): Promise<unknown> {
    try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];

        if (!activeTab?.id) {
            throw new Error('No active tab found');
        }

        return browser.tabs.sendMessage(activeTab.id, message);
    } catch (error) {
        console.error('Error sending message to active tab:', error);
        throw error;
    }
}

/**
 * Initiates selective screenshot by sending message to content script
 */
export async function initiateSelectiveScreenshot(): Promise<unknown> {
    return sendMessageToActiveTab(TabMessages.startSelection());
}

/**
 * Shows the result modal by sending message to content script
 */
export function showResultModal(resultModalType: ResultModalType): Promise<unknown> {
    return sendMessageToActiveTab(TabMessages.showResultModal(resultModalType));
}

// stream id received message sending
export function receiveStreamId(streamId: string): Promise<unknown> {
    console.log('Received stream ID:', streamId);
    return sendMessageToActiveTab(TabMessages.streamIdReceived(streamId));
}

export function showRecordingControls(): Promise<unknown> {
    return sendMessageToActiveTab(TabMessages.showRecordingControls());
}

/*
 * ====================================================================================
 */

/**
 * Sends a message to the background script
 */
export function sendRuntimeMessage(message: RuntimeMessage): Promise<unknown> {
    return browser.runtime.sendMessage(message);
}

/**
 * Initiates full page screenshot by sending message to background
 */
export function initiateFullScreenshot(): Promise<unknown> {
    return sendRuntimeMessage(RuntimeMessages.takeFullScreenshot());
}

/**
 * Initiates region screenshot by sending message to background
 */
export function initiateRegionScreenshot(region: SelectionArea): Promise<unknown> {
    return sendRuntimeMessage(RuntimeMessages.takeRegionScreenshot(region));
}

export async function initiateVideoRecording(): Promise<unknown> {
    console.log('Starting tab recording...');
    try {
        return sendRuntimeMessage(RuntimeMessages.startVideoCapture());
    } catch (error) {
        console.error("Error starting tab capture:", error);
        throw error;
    }
}

export async function stopVideoCapture(): Promise<unknown> {
    try {
        return sendRuntimeMessage(RuntimeMessages.stopVideoCapture());
    } catch (error) {
        console.error("Error stopping tab capture:", error);
        throw error;
    }
}
