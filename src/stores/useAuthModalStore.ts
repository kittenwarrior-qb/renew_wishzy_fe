import { create } from 'zustand';

interface AuthModalStore {
    isOpen: boolean;
    openLoginModal: () => void;
    closeLoginModal: () => void;
}

export const useAuthModalStore = create<AuthModalStore>((set) => ({
    isOpen: false,
    openLoginModal: () => set({ isOpen: true }),
    closeLoginModal: () => set({ isOpen: false }),
}));
