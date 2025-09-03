// store/useHyperparameters.ts
import { create } from "zustand";

export interface HyperparameterState {
  // Hyperparameter values
  maxOutputTokens: number;
  temperature: number;
  topP: number;
  similarityMetric: string;
  topK: number;

  // UI state
  isExpanded: boolean;

  // Actions
  setMaxOutputTokens: (value: number) => void;
  setTemperature: (value: number) => void;
  setTopP: (value: number) => void;
  setSimilarityMetric: (value: string) => void;
  setTopK: (value: number) => void;
  setIsExpanded: (value: boolean) => void;

  // Reset to defaults
  resetToDefaults: () => void;

  // Get all hyperparameters as object (for API calls)
  getHyperparameters: () => {
    maxOutputTokens: number;
    temperature: number;
    topP: number;
    similarityMetric: string;
    topK: number;
  };
}

// Default values
const defaultHyperparameters = {
  maxOutputTokens: 1000,
  temperature: 0.7,
  topP: 0.9,
  similarityMetric: "cosine",
  topK: 10,
  isExpanded: true,
};

export const useHyperparameters = create<HyperparameterState>((set, get) => ({
  // Initial state
  ...defaultHyperparameters,

  // Actions
  setMaxOutputTokens: (value: number) => set({ maxOutputTokens: value }),
  setTemperature: (value: number) => set({ temperature: value }),
  setTopP: (value: number) => set({ topP: value }),
  setSimilarityMetric: (value: string) => set({ similarityMetric: value }),
  setTopK: (value: number) => set({ topK: value }),
  setIsExpanded: (value: boolean) => set({ isExpanded: value }),

  resetToDefaults: () => set(defaultHyperparameters),

  getHyperparameters: () => {
    const state = get();
    return {
      maxOutputTokens: state.maxOutputTokens,
      temperature: state.temperature,
      topP: state.topP,
      similarityMetric: state.similarityMetric,
      topK: state.topK,
    };
  },
}));
