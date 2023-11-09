interface ModalElement extends HTMLElement {
    showModal(): void;
    close(): void;
}

export const openModal = (id: string) => {
    const element = document.getElementById(id);
    const modal = element as ModalElement | null;
    modal?.showModal();
};

export const closeModal = (id: string) => {
    const element = document.getElementById(id);
    const modal = element as ModalElement | null;
    modal?.close();
};
