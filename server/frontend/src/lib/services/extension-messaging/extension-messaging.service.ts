import {
    TARGET_EXTENSION_ORIGIN,
    WEB_APP_MESSAGE_SOURCE,
} from './extension-messaging.config';
import { WebAppMessageType, type WebAppMessage } from './extension-messaging.types';

class ExtensionMessagingService {
    private _isExtensionReady: boolean = false;

    constructor() {
        console.log('Initializing ExtensionMessagingService...');
        this.checkForExtension();
    }

    get isExtensionReady(): boolean {
        return this._isExtensionReady;
    }

    private setExtensionReady(isReady: boolean): void {
        this._isExtensionReady = isReady;
    }

    public checkForExtension(): void {
        // TODO: find a way to check if the extension is installed
        this.setExtensionReady(true);
    }

    public sendMessage(message: WebAppMessage): boolean {
        if (typeof window === 'undefined') {
            console.error('Cannot send message: window object is not available.');
            return false;
        }

        if (!this._isExtensionReady) {
            console.warn(
                `Rebug extension is not ready or not detected. Message of type "${message.type}" not sent.`
            );
            return false;
        }

        try {
            window.postMessage(message, TARGET_EXTENSION_ORIGIN);
            console.log(`Message sent to extension:`, message);
            return true;
        } catch (error) {
            console.error('Error sending message to extension:', error);
            return false;
        }
    }
}

export const extensionMessagingService = new ExtensionMessagingService();
