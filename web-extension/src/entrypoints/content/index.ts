import { runtimeMessagingService } from "$lib/services/messaging";
import "~/assets/tailwind.css";
import { initializeMessageListener } from "./handlers/messageHandler";
import { closeRecordingControlsOverlay, openRecordingControlsOverlay } from "./ui/recordingControls";
import { injectRebugResultModal } from "./ui/resultModal";

export default defineContentScript({
  cssInjectionMode: "ui",
  matches: ["*://*/*"],
  async main(ctx) {
    injectRebugResultModal(ctx);

    initializeMessageListener(ctx);

    runtimeMessagingService.isRecordingInProgress()
      .then((messageResponse) => {
        if (messageResponse.data?.inProgress) {
          console.log("Recording in progress, showing controls overlay...", messageResponse.data);
          openRecordingControlsOverlay(
            ctx,
            async () => {
              await closeRecordingControlsOverlay()
              console.log('Recording controls closed');
              runtimeMessagingService.stopVideoCapture();
            },
            messageResponse.data.recordStartDate ? new Date(messageResponse.data.recordStartDate) : undefined
          );
        }
      })
  },
});
