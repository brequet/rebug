import {
    WEB_APP_MESSAGE_SOURCE,
    EXTENSION_READY_FLAG,
    TARGET_EXTENSION_ORIGIN,
} from './extension-messaging.config';
import { WebAppMessageType, type BaseWebAppMessage, type WebAppMessage } from './extension-messaging.types';

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
        // Check for the flag set by the content script
        if (typeof window !== 'undefined' && (window as any)[EXTENSION_READY_FLAG]) {
            this.setExtensionReady(true);
        } else {
            // Fallback: check after a small delay in case content script loads later
            setTimeout(() => {
                if (typeof window !== 'undefined' && (window as any)[EXTENSION_READY_FLAG]) {
                    this.setExtensionReady(true);
                } else {
                    this.setExtensionReady(false);
                    console.warn('Rebug extension content script not detected.');
                }
            }, 1000);
        }
    }

    public sendMessage<T>(
        type: WebAppMessageType | string,
        payload?: T
    ): boolean {
        if (typeof window === 'undefined') {
            console.error('Cannot send message: window object is not available.');
            return false;
        }

        // if (!this._isExtensionReady) {
        //     console.warn(
        //         `Rebug extension is not ready or not detected. Message of type "${type}" not sent.`
        //     );
        //     return false;
        // }

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
