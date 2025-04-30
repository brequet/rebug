import { SelectionArea } from "$lib/messaging/types";
import { mount } from "svelte";
import { ContentScriptContext, ShadowRootContentScriptUi } from "wxt/client";
import ScreenshotOverlay from "./ScreenshotOverlay.svelte";

export async function createRecordingControlsOverlay(
    ctx: ContentScriptContext,
    onCompleteCallback: (selectionArea: SelectionArea) => void,
    onCancelCallback: () => void
): Promise<ShadowRootContentScriptUi<void>> {
    return createShadowRootUi(ctx, {
        name: 'rebug-recording-controls-overlay-ui',
        position: 'inline',
        anchor: 'body',
        onMount: (container) => {
            mount(ScreenshotOverlay, {
                target: container,
                props: {
                    onComplete: onCompleteCallback,
                    onCancel: onCancelCallback
                }
            });
        },
    });
}