// store/useTrainingHyperparameters.ts
import { create } from "zustand";

export interface TrainingHyperparameterState {
  // Training hyperparameter values
  learningRate: number;
  batchSize: number;
  epochs: number;
  optimizer: string;
  momentum: number;
  dropout: number;
  regularization: string;
  validationSplit: number;

  // UI state
  isExpanded: boolean;

  // Actions
  setLearningRate: (value: number) => void;
  setBatchSize: (value: number) => void;
  setEpochs: (value: number) => void;
  setOptimizer: (value: string) => void;
  setMomentum: (value: number) => void;
  setDropout: (value: number) => void;
  setRegularization: (value: string) => void;
  setValidationSplit: (value: number) => void;
  setIsExpanded: (value: boolean) => void;

  // Reset to defaults
  resetToDefaults: () => void;

  // Get all hyperparameters as object (for API calls)
  getHyperparameters: () => {
    learningRate: number;
    batchSize: number;
    epochs: number;
    optimizer: string;
    momentum: number;
    dropout: number;
    regularization: string;
    validationSplit: number;
  };
}

// Default values for traditional ML training
const defaultTrainingHyperparameters = {
  learningRate: 0.001,
  batchSize: 32,
  epochs: 100,
  optimizer: "adam",
  momentum: 0.9,
  dropout: 0.2,
  regularization: "l2",
  validationSplit: 0.2,
  isExpanded: true,
};

export const useTrainingHyperparameters = create<TrainingHyperparameterState>(
  (set, get) => ({
    // Initial state
    ...defaultTrainingHyperparameters,

    // Actions
    setLearningRate: (value: number) => set({ learningRate: value }),
    setBatchSize: (value: number) => set({ batchSize: value }),
    setEpochs: (value: number) => set({ epochs: value }),
    setOptimizer: (value: string) => set({ optimizer: value }),
    setMomentum: (value: number) => set({ momentum: value }),
    setDropout: (value: number) => set({ dropout: value }),
    setRegularization: (value: string) => set({ regularization: value }),
    setValidationSplit: (value: number) => set({ validationSplit: value }),
    setIsExpanded: (value: boolean) => set({ isExpanded: value }),

    resetToDefaults: () => set(defaultTrainingHyperparameters),

    getHyperparameters: () => {
      const state = get();
      return {
        learningRate: state.learningRate,
        batchSize: state.batchSize,
        epochs: state.epochs,
        optimizer: state.optimizer,
        momentum: state.momentum,
        dropout: state.dropout,
        regularization: state.regularization,
        validationSplit: state.validationSplit,
      };
    },
  })
);
