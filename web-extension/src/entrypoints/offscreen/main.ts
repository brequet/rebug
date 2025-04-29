import { logger } from "$lib/utils/logger";
import { initializeMessageListener } from "./handlers/messageHandler";

const log = logger.getLogger('Offscreen');

function main(): void {
    log.info("Offscreen document is working!", window);

    initializeMessageListener();
}

main();