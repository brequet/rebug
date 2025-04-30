import { ResultModalType, ShowResultModalMessage, VIDEO_CAPTURE_MIME_TYPE } from "$lib/messaging/types";
import { base64ToBlob } from "$lib/messaging/utils/blob-utils";
import { screenshotStorage } from "$lib/services/storage";
import { mount } from "svelte";
import { ContentScriptContext, ShadowRootContentScriptUi } from "wxt/client";
import { modalStore, ResultModalProps } from "./modal.store";
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
    if (message.payload.resultType === ResultModalType.IMAGE) {
        const imageString = await screenshotStorage.getValue();
        if (!imageString) {
            throw new Error('No screenshot found in storage');
        }
        return { imageString };
    } else if (message.payload.resultType === ResultModalType.VIDEO) {
        if (!message.payload.videoBlobAsBase64) {
            throw new Error('No blob URL provided for video result modal');
        }
        const videoBlob = base64ToBlob(message.payload.videoBlobAsBase64, VIDEO_CAPTURE_MIME_TYPE)
        return { videoBlob };
    }

    throw new Error(`Unsupported result modal type: ${message.payload.resultType}`);
}
