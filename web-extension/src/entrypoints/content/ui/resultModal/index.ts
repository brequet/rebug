import { AuthUtils } from "$lib/auth/auth.utils";
import { ResultModalType, ShowResultModalMessage, VIDEO_CAPTURE_MIME_TYPE } from "$lib/messaging/types";
import { base64ToBlob } from "$lib/messaging/utils/blob-utils";
import { mount } from "svelte";
import { ContentScriptContext, ShadowRootContentScriptUi } from "wxt/client";
import ResultModal from "./components/ResultModal.svelte";
import { modalStore, ResultModalProps } from "./modalStore.svelte";

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
    const user = await AuthUtils.getCurrentUser() || undefined;
    if (message.payload.resultType === ResultModalType.IMAGE) {
        return { imageString: message.payload.base64Image, user };
    } else if (message.payload.resultType === ResultModalType.VIDEO) {
        if (!message.payload.base64Video) {
            throw new Error('No blob URL provided for video result modal');
        }
        const videoBlob = base64ToBlob(message.payload.base64Video, VIDEO_CAPTURE_MIME_TYPE)
        return { videoBlob, user };
    }

    throw new Error(`Unsupported result modal type: ${message}`);
}
