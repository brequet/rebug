import { initializeMessageListener } from "./handlers/messageHandler";

function main(): void {
    console.log("[OFFSCREEN] Offscreen document is working!", window);

    initializeMessageListener();
}

main();