import { BrowserInfo } from "$lib/report";
import { logger } from "./logger";

const log = logger.getLogger('TabUtils');

const RESTRICTED_SCHEMES = [
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
    const tab = await getActiveTab();
    if (tab?.url == undefined) return false;

    const tabUrl = tab.url;

    return !RESTRICTED_SCHEMES.some(scheme =>
      tabUrl.startsWith(scheme)
    );
  } catch (error) {
    return false;
  }
}

export async function getActiveTab(): Promise<Browser.tabs.Tab | undefined> {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) {
      log.warn('No active tab found.');
      return undefined;
    }
    return tabs[0];
  } catch (error) {
    log.error('Error querying for active tab:', error);
    return undefined;
  }
}

export async function getActiveTabId(): Promise<number | undefined> {
  try {
    const tab = await getActiveTab();
    if (tab?.id === undefined) {
      log.warn('Could not determine active tab ID.');
      return undefined;
    }
    return tab.id;
  } catch (error) {
    log.error('Error querying for active tab:', error);
    return undefined;
  }
}

export async function getCurrentTab(): Promise<Browser.tabs.Tab | undefined> {
  try {
    const tabs = await browser.tabs.query({ currentWindow: true });
    if (tabs.length === 0) {
      log.warn('No current tab found.');
      return undefined;
    }
    return tabs[0];
  } catch (error) {
    log.error('Error querying for current tab:', error);
    return undefined;
  }
}

export function getBrowserInfo(): BrowserInfo | undefined {
  const ua = navigator.userAgent;
  let match: RegExpMatchArray | null;

  // Order matters here
  if ((match = ua.match(/(edg)\/([\d.]+)/i))) {
    // Edge (Chromium)
    return { name: "Edge", version: match[2] };
  }
  if ((match = ua.match(/(chrome|crios|crmo)\/([\d.]+)/i))) {
    // Chrome
    return { name: "Chrome", version: match[2] };
  }
  if ((match = ua.match(/(firefox|fxios)\/([\d.]+)/i))) {
    // Firefox
    return { name: "Firefox", version: match[2] };
  }
  if ((match = ua.match(/version\/([\d.]+).*safari/i))) {
    // Safari
    return { name: "Safari", version: match[1] };
  }

  return undefined;
}

/**
 * Determines the user's operating system.
 * @returns {string} The name of the operating system (e.g., 'Windows', 'macOS', 'Linux').
 */
export function getOS(): string | undefined {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
  const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
  const iosPlatforms = ['iPhone', 'iPad', 'iPod'];

  if (macosPlatforms.indexOf(platform) !== -1) {
    return 'macOS';
  }
  if (iosPlatforms.indexOf(platform) !== -1) {
    return 'iOS';
  }
  if (windowsPlatforms.indexOf(platform) !== -1) {
    return 'Windows';
  }
  if (/Android/.test(userAgent)) {
    return 'Android';
  }
  if (/Linux/.test(platform)) {
    return 'Linux';
  }

  return undefined;
}
