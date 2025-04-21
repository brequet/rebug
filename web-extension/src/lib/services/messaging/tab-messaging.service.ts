import { MessageProcessingResponse } from "$lib/types/messaging/base";
import { ResultModalType, TabMessage, TabMessages } from "$lib/types/messaging/tab";
import { getCurrentTab } from "../capture";
import { BaseMessagingService } from "./base-messaging.service";

export class TabMessagingService extends BaseMessagingService {
    /**
     * Sends a message to the active tab's content script
     */
    private async sendMessageToActiveTab(message: TabMessage): Promise<MessageProcessingResponse> {
        try {
            const activeTab = await getCurrentTab();

            if (!activeTab?.id) {
                throw new Error('No active tab found');
            }

            console.debug(`Sending message to tab ${activeTab.id}:`, message.type);
            return browser.tabs.sendMessage(activeTab.id, message);
        } catch (error) {
            return this.handleError('sending message to active tab', error);
        }
    }

    /**
     * Initiates selective screenshot by sending message to content script
     */
    initiateSelectiveScreenshot(): Promise<MessageProcessingResponse> {
        return this.sendMessageToActiveTab(TabMessages.startSelection());
    }

    /**
     * Shows the result modal by sending message to content script
     */
    showResultModal(resultModalType: ResultModalType, videoBlobAsBase64?: string): Promise<MessageProcessingResponse> {
        return this.sendMessageToActiveTab(TabMessages.showResultModal(resultModalType, videoBlobAsBase64));
    }

    /**
     * Shows recording controls in the content script
     */
    showRecordingControls(startDate: Date): Promise<MessageProcessingResponse> {
        return this.sendMessageToActiveTab(TabMessages.showRecordingControls(startDate));
    }
}

export const tabMessagingService = new TabMessagingService();
