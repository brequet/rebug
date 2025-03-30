import { base64ToBlob } from "$lib/services/capture";
import { capturedVideo, screenshot } from "$lib/services/storage";
import { modalStore, ResultModalProps } from "$lib/stores/modal.store";
import { VIDEO_CAPTURE_MIME_TYPE } from "$lib/types/capture";
import { ResultModalType } from "$lib/types/messages";
import { mount } from "svelte";
import { ContentScriptContext, ShadowRootContentScriptUi } from "wxt/client";
import ResultModal from "./ResultModal.svelte";

export async function injectRebugResultModal(ctx: ContentScriptContext): Promise<void> {
    (await createRebugResultModalUi(ctx)).mount();
}

export async function openRebugResultModal(resultModalType: ResultModalType): Promise<void> {
    const props = await getResultModalProps(resultModalType);
    modalStore.open(props);
}

async function createRebugResultModalUi(ctx: ContentScriptContext): Promise<ShadowRootContentScriptUi<void>> {
    return createShadowRootUi(ctx, {
        name: 'rebug-result-modal-ui',
        position: 'inline',
        anchor: 'body',
        onMount: (container) => {
            mount(ResultModal, {
                target: container,
            });
        },
    });
}

async function getResultModalProps(resultModalType: ResultModalType): Promise<ResultModalProps> {
    if (resultModalType === ResultModalType.IMAGE) {
        const imageString = await screenshot.getValue();
        if (!imageString) {
            throw new Error('No screenshot found in storage');
        }
        return { imageString };
    } else if (resultModalType === ResultModalType.VIDEO) {
        const videoBlobStr = await capturedVideo.getValue();
        if (!videoBlobStr) {
            throw new Error('No video found in storage');
        }

        const videoBlob = base64ToBlob(videoBlobStr, VIDEO_CAPTURE_MIME_TYPE)
        if (!videoBlob) {
            throw new Error('Failed to convert video blob from base64 string');
        }

        return { videoBlob };
    }

    throw new Error(`Unsupported result modal type: ${resultModalType}`);
}
