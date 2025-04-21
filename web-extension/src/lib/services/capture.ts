export const RESTRICTED_SCHEMES = [
    'chrome:',
    'edge:',
    'brave:',
    'about:',
    'moz-extension:',
    'chrome-extension:',
    'vivaldi:'
];

export async function isCaptureAllowed(): Promise<boolean> {
    try {
        const tab = await getCurrentTab();
        if (tab?.url == undefined) return false;

        const tabUrl = tab.url;

        return !RESTRICTED_SCHEMES.some(scheme =>
            tabUrl.startsWith(scheme)
        );
    } catch (error) {
        return false;
    }
}

export async function getCurrentTab(): Promise<chrome.tabs.Tab | undefined> {
    try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        return tab;
    } catch (error) {
        console.error('Error getting current tab:', error);
        return undefined;
    }
}

export function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export function base64ToBlob(base64: string, type: string): Blob {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type });
}
