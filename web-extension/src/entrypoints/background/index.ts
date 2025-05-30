import { logger } from "$lib/utils/logger";
import { initializeMessageListener } from "./handlers/messageHandler";

const log = logger.getLogger('Background');

export default defineBackground(() => {
  log.info('Background running', { id: browser.runtime.id });

  initializeMessageListener();
});
