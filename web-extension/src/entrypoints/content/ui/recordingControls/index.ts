import { mount } from "svelte";
import { ContentScriptContext, ShadowRootContentScriptUi } from "wxt/client";
import RecordingControlsOverlay from "./RecordingControlsOverlay.svelte";

let recordingControlsOverlay: ShadowRootContentScriptUi<void> | null = null;

export async function openRecordingControlsOverlay(ctx: ContentScriptContext, onCloseCallback: () => void, recordStartDate: Date): Promise<void> {
    recordingControlsOverlay = await createRecordingControlsOverlay(ctx, onCloseCallback, recordStartDate);
    recordingControlsOverlay.mount();
}

export async function closeRecordingControlsOverlay(): Promise<void> {
    if (recordingControlsOverlay) {
        recordingControlsOverlay.remove();
        recordingControlsOverlay = null;
    }
}

async function createRecordingControlsOverlay(ctx: ContentScriptContext, onCloseCallback: () => void, recordStartDate: Date): Promise<ShadowRootContentScriptUi<void>> {
    return createShadowRootUi(ctx, {
        name: 'rebug-recording-controls-overlay-ui',
        position: 'inline',
        anchor: 'body',
        onMount: (container) => {
            mount(RecordingControlsOverlay, {
                target: container,
                props: {
                    onClose: onCloseCallback,
                    recordStartDate
                }
            });
        },
    });
}