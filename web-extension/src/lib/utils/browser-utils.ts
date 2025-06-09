import type { BrowserInfo } from '../report/context.types';

export async function getBrowserInfo(): Promise<BrowserInfo> {
    try {
        // TODO: use getPlatformInfo() for more detailed info in Firefox
        // const info = await browser.runtime.getBrowserInfo();
        // return {
        //     name: info.name,
        //     version: info.version,
        //     userAgent: navigator.userAgent
        // };
    } catch (error) {
        // Fallback for other browsers or if the API is not available
        console.warn('browser.runtime.getBrowserInfo() not available, using fallback.', error);
        return {
            name: 'Unknown',
            version: 'Unknown',
            userAgent: navigator.userAgent
        };
    }
}
