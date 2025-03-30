import { writable, type Writable } from "svelte/store";

export interface ResultModalProps {
    imageString?: string;
    videoBlob?: Blob;
}

type ModalState = {
    isOpen: boolean;
    props: ResultModalProps
};

const initialState: ModalState = {
    isOpen: false,
    props: {}
};

function createModalStore() {
    const { subscribe, set }: Writable<ModalState> = writable(initialState);

    return {
        subscribe,
        open: (props: ResultModalProps) => set({ isOpen: true, props }),
        close: () => set({ isOpen: false, props: {} }),
    };
}

export const modalStore = createModalStore();
