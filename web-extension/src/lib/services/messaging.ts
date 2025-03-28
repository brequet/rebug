import { RuntimeMessage, RuntimeMessages, TabMessage, TabMessages } from "$lib/types/messages";

/**
 * Sends a message to the active tab's content script
 */
export async function sendMessageToActiveTab(message: TabMessage): Promise<any> {
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
export async function initiateSelectiveScreenshot(): Promise<void> {
    await sendMessageToActiveTab(TabMessages.startSelection());
}

/**
 * Shows the result modal by sending message to content script
 */
export function showResultModal(): Promise<any> {
    return sendMessageToActiveTab(TabMessages.showResultModal());
}

/**
 * Sends a message to the background script
 */
export function sendRuntimeMessage(message: RuntimeMessage): Promise<any> {
    return browser.runtime.sendMessage(message);
}

/**
 * Initiates full page screenshot by sending message to background
 */
export function initiateFullScreenshot(): Promise<any> {
    return sendRuntimeMessage(RuntimeMessages.takeFullScreenshot());
}
