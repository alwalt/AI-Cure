import { create } from "zustand";

interface IsRightVisible {
  isRightColumnVisible: boolean;
  toggleRightColumn: () => void;
  setRightColumnVisible: (visible: boolean) => void;
}

export const useIsRightVisible = create<IsRightVisible>((set) => ({
  isRightColumnVisible: true,
  toggleRightColumn: () =>
    set((state) => ({ isRightColumnVisible: !state.isRightColumnVisible })),
  setRightColumnVisible: (visible) => set({ isRightColumnVisible: visible }),
}));
