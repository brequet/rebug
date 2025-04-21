import { base64ToBlob } from "$lib/services/capture";
import { screenshot } from "$lib/services/storage";
import { modalStore, ResultModalProps } from "$lib/stores/modal.store";
import { VIDEO_CAPTURE_MIME_TYPE } from "$lib/types/capture";
import { ResultModalType, ShowResultModalMessage } from "$lib/types/messaging/tab";
import { mount } from "svelte";
import { ContentScriptContext, ShadowRootContentScriptUi } from "wxt/client";
import ResultModal from "./ResultModal.svelte";

export async function injectRebugResultModal(ctx: ContentScriptContext): Promise<void> {
    (await createRebugResultModalUi(ctx)).mount();
}

export async function openRebugResultModal(message: ShowResultModalMessage): Promise<void> {
    const props = await getResultModalProps(message);
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

async function getResultModalProps(message: ShowResultModalMessage): Promise<ResultModalProps> {
    if (message.resultModalType === ResultModalType.IMAGE) {
        const imageString = await screenshot.getValue();
        if (!imageString) {
            throw new Error('No screenshot found in storage');
        }
        return { imageString };
    } else if (message.resultModalType === ResultModalType.VIDEO) {
        if (!message.videoBlobAsBase64) {
            throw new Error('No blob URL provided for video result modal');
        }
        // console.log('Video blob URL:', message.blobUrl);
        const videoBlob = base64ToBlob(message.videoBlobAsBase64, VIDEO_CAPTURE_MIME_TYPE)
        return { videoBlob };
    }

    throw new Error(`Unsupported result modal type: ${message.resultModalType}`);
}
