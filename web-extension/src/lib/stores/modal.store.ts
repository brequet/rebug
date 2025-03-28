import { writable, type Writable } from "svelte/store";

interface ResultModalProps {
    imageString?: string;
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
    const { subscribe, set, update }: Writable<ModalState> = writable(initialState);

    return {
        subscribe,
        open: (props: ResultModalProps) => set({ isOpen: true, props }),
        close: () => set({ isOpen: false, props: {} }),
        updateProps: (newProps: Partial<ResultModalProps>) => update(current =>
            current ? { ...current, props: { ...current.props, ...newProps } } : initialState
        )
    };
}

export const modalStore = createModalStore();
