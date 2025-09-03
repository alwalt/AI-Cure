import { create } from "zustand";

export interface AssayEntry {
  sample_name: string;
  protein: string;
  imaging_method: string;
  blocking_duration: string;
  block_concentration: string;
}

export interface AssaysStoreState {
  // Raw titles from the first API call
  assayTitles: string[] | null;

  // Processed table data
  assaysData: AssayEntry[] | null;

  // Loading states
  isLoadingTitles: boolean;
  isLoadingTableData: boolean;

  // Error handling
  error: string | null;

  // Actions
  setAssayTitles: (titles: string[]) => void;
  setAssaysData: (assays: AssayEntry[]) => void;
  setIsLoadingTitles: (loading: boolean) => void;
  setIsLoadingTableData: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Clear/reset functionality
  clearAssaysData: () => void;

  // Utility actions
  addAssayEntry: (entry: AssayEntry) => void;
  updateAssayEntry: (index: number, entry: Partial<AssayEntry>) => void;
  removeAssayEntry: (index: number) => void;
}

const useAssaysStore = create<AssaysStoreState>((set, get) => ({
  // Initial state
  assayTitles: null,
  assaysData: null,
  isLoadingTitles: false,
  isLoadingTableData: false,
  error: null,

  // Basic setters
  setAssayTitles: (titles) => set({ assayTitles: titles, error: null }),
  setAssaysData: (assays) => set({ assaysData: assays, error: null }),
  setIsLoadingTitles: (loading) => set({ isLoadingTitles: loading }),
  setIsLoadingTableData: (loading) => set({ isLoadingTableData: loading }),
  setError: (error) => set({ error }),

  // Clear all assays data
  clearAssaysData: () =>
    set({
      assayTitles: null,
      assaysData: null,
      isLoadingTitles: false,
      isLoadingTableData: false,
      error: null,
    }),

  // Utility functions for managing individual entries
  addAssayEntry: (entry) =>
    set((state) => ({
      assaysData: [...(state.assaysData || []), entry],
    })),

  updateAssayEntry: (index, updates) =>
    set((state) => {
      if (!state.assaysData) return state;
      const newAssaysData = [...state.assaysData];
      newAssaysData[index] = { ...newAssaysData[index], ...updates };
      return { assaysData: newAssaysData };
    }),

  removeAssayEntry: (index) =>
    set((state) => {
      if (!state.assaysData) return state;
      const newAssaysData = state.assaysData.filter((_, i) => i !== index);
      return { assaysData: newAssaysData };
    }),
}));

export default useAssaysStore;
