import {
    TARGET_EXTENSION_ORIGIN,
    WEB_APP_MESSAGE_SOURCE,
} from './extension-messaging.config';
import { WebAppMessageType, type BaseWebAppMessage } from './extension-messaging.types';

class ExtensionMessagingService {
    private _isExtensionReady: boolean = false;

    constructor() {
        console.log('Initializing ExtensionMessagingService...');

        this.checkForExtension();
        setTimeout(() => {
            this.sendMessage(WebAppMessageType.USER_ACTION, {
                actionName: 'ExtensionCheck',
                details: {
                    status: this._isExtensionReady ? 'ready' : 'not ready',
                },
            });
        }, 1500);
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

    public sendMessage<T>(
        type: WebAppMessageType | string,
        payload?: T
    ): boolean {
        if (typeof window === 'undefined') {
            console.error('Cannot send message: window object is not available.');
            return false;
        }

        if (!this._isExtensionReady) {
            console.warn(
                `Rebug extension is not ready or not detected. Message of type "${type}" not sent.`
            );
            return false;
        }

        const message: BaseWebAppMessage<T> = {
            source: WEB_APP_MESSAGE_SOURCE,
            type,
            payload,
        };

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
