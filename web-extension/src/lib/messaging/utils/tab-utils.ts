import { logger } from "../../utils/logger";

const log = logger.getLogger('TabUtils');

export async function getCurrentTabId(): Promise<number | undefined> {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0 && tabs[0]?.id !== undefined) {
      return tabs[0].id;
    }
    log.warn('Could not determine active tab ID.');
    return undefined;
  } catch (error) {
    log.error('Error querying for active tab:', error);
    return undefined;
  }
}