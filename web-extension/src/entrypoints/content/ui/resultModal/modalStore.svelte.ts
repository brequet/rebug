export interface ResultModalProps {
    imageString?: string;
    videoBlob?: Blob;
    userName?: string;
}

type ModalState = {
    isOpen: boolean;
    props: ResultModalProps;
}

const initialState: ModalState = {
    isOpen: false,
    props: {}
};

const modalState = $state(initialState);

export const modalStore = {
    get isOpen() { return modalState.isOpen; },
    get props() { return modalState.props; },

    open: (props: ResultModalProps) => {
        modalState.isOpen = true;
        modalState.props = props;
    },

    close: () => {
        modalState.isOpen = false;
        modalState.props = {};
    }
};
