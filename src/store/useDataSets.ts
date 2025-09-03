// store/useDataSets.ts
import { create } from "zustand";

export interface DataSet {
  name: string;
  type: string;
  dateCreated: string;
  size: number;
  file?: File;
  selected: boolean;
  id: string;
}

export interface DataSetsState {
  // Dataset values
  uploadedDataSets: DataSet[];
  selectedDataSets: DataSet[];
  currentPreviewDataSet: DataSet | null;
  lastClearedTimestamp: number;

  // Actions
  addDataSets: (dataSets: DataSet[]) => void;
  setSelectedDataSets: (
    dataSets: DataSet[] | ((prev: DataSet[]) => DataSet[])
  ) => void;
  setCurrentPreviewDataSet: (dataSet: DataSet | null) => void;
  clearAllDataSets: () => void;
  removeDataSet: (dataSetId: string) => void;
  updateDataSet: (dataSetId: string, updates: Partial<DataSet>) => void;

  // Get all selected datasets for processing
  getSelectedDataSets: () => DataSet[];
}

export const useDataSets = create<DataSetsState>((set, get) => ({
  // Initial state
  uploadedDataSets: [],
  selectedDataSets: [],
  currentPreviewDataSet: null,
  lastClearedTimestamp: 0,

  // Actions
  addDataSets: (dataSets: DataSet[]) => {
    set((state) => ({
      uploadedDataSets: [
        ...state.uploadedDataSets,
        ...dataSets.map((ds) => ({
          ...ds,
          id: ds.id || `${Date.now()}-${Math.random()}`,
        })),
      ],
    }));
  },

  setSelectedDataSets: (dataSets) => {
    set((state) => ({
      selectedDataSets:
        typeof dataSets === "function"
          ? dataSets(state.selectedDataSets)
          : dataSets,
    }));
  },

  setCurrentPreviewDataSet: (dataSet) => {
    set({ currentPreviewDataSet: dataSet });
  },

  clearAllDataSets: () => {
    set({
      uploadedDataSets: [],
      selectedDataSets: [],
      currentPreviewDataSet: null,
      lastClearedTimestamp: Date.now(),
    });
  },

  removeDataSet: (dataSetId) => {
    set((state) => ({
      uploadedDataSets: state.uploadedDataSets.filter(
        (ds) => ds.id !== dataSetId
      ),
      selectedDataSets: state.selectedDataSets.filter(
        (ds) => ds.id !== dataSetId
      ),
      currentPreviewDataSet:
        state.currentPreviewDataSet?.id === dataSetId
          ? null
          : state.currentPreviewDataSet,
    }));
  },

  updateDataSet: (dataSetId, updates) => {
    set((state) => ({
      uploadedDataSets: state.uploadedDataSets.map((ds) =>
        ds.id === dataSetId ? { ...ds, ...updates } : ds
      ),
      selectedDataSets: state.selectedDataSets.map((ds) =>
        ds.id === dataSetId ? { ...ds, ...updates } : ds
      ),
    }));
  },

  getSelectedDataSets: () => {
    return get().selectedDataSets;
  },
}));
