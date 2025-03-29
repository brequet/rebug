
export const RESTRICTED_SCHEMES = [
    'chrome:',
    'edge:',
    'brave:',
    'about:',
    'moz-extension:',
    'chrome-extension:',
    'vivaldi:'
];

export async function isScreenshotAllowed(): Promise<boolean> {
    try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

        if (tab?.url == undefined) return false;
        const tabUrl = tab.url;

        return !RESTRICTED_SCHEMES.some(scheme =>
            tabUrl.startsWith(scheme)
        );
    } catch (error) {
        return false;
    }
}
