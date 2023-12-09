export const openModal = (id: string) => {
    const element = document.getElementById(id);
    const modal = element as HTMLDialogElement | null;
    modal?.showModal();
};

export const closeModal = (id: string) => {
    const element = document.getElementById(id);
    const modal = element as HTMLDialogElement | null;
    modal?.close();
};
