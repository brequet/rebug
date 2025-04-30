import { logger } from "../../utils/logger";

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

export async function getCurrentTabId(): Promise<number | undefined> {
  try {
    const tab = await getCurrentTab();
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
