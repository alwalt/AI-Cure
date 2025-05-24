import { create, StoreApi } from "zustand";
import { UploadedFile } from "@/types/files";

export interface SessionFileStoreState {
  sessionId: string | null;
  previewCsv: string | null;
  previewFile: UploadedFile | null;
  selectedFiles: UploadedFile[];
  setSessionId: (id: string | null) => void;
  setPreviewCsv: (filename: string | null) => void;
  setPreviewFile: (file: UploadedFile | null) => void;
  setSelectedFiles: (
    files: UploadedFile[] | ((prev: UploadedFile[]) => UploadedFile[])
  ) => void;
  handlePreview: (csvFilename: string) => void;
  handleFilePreview: (file: UploadedFile | null) => void;
  ragData: Record<string, string>;
  setRagData: (data: Record<string, string>) => void;
  updateRagSection: (section: string, text: string) => void;
  fullRagData: Record<string, string | string[]>;
  setFullRagData: (data: Record<string, string | string[]>) => void;

  collectionFiles: UploadedFile[];
  addToCollectionFiles: (filesToAdd: UploadedFile[]) => void;
}

const sessionFileStore = create<SessionFileStoreState>((set, get) => ({
  sessionId: null,
  previewCsv: null,
  previewFile: null,
  selectedFiles: [],
  setSessionId: (id) => set({ sessionId: id }),
  setPreviewCsv: (filename) => set({ previewCsv: filename, previewFile: null }),
  setPreviewFile: (file) => set({ previewFile: file, previewCsv: null }),

  setSelectedFiles: (files) =>
    set((state) => ({
      selectedFiles:
        typeof files === "function" ? files(state.selectedFiles) : files,
    })),

  handlePreview: (csvFilename) => {
    set({
      previewCsv: csvFilename,
      previewFile: null,
    });
  },

  handleFilePreview: (file) => {
    set({
      previewFile: file,
      previewCsv: null,
    });
  },
  fullRagData: {},
  setFullRagData: (data) => {
    const newRagData: Record<string, string> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        if (typeof value === 'string') {
          newRagData[key] = value;
        } else if (Array.isArray(value)) {
          newRagData[key] = value.join(', ');
        } else if (value !== null && value !== undefined) {
          newRagData[key] = String(value);
        } else {
          newRagData[key] = '';
        }
      }
    }
    console.log("Zustand Store: Setting fullRagData and derived ragData", data, newRagData);
    set({ fullRagData: data, ragData: newRagData });
  },

  ragData: {},
  setRagData: (data) => set({ ragData: data }),
  updateRagSection: (section, text) =>
    set((state) => {
      const updatedRagData = { ...state.ragData, [section]: text };
      const updatedFullRagData = { ...state.fullRagData };
      if (Object.prototype.hasOwnProperty.call(updatedFullRagData, section) && typeof updatedFullRagData[section] === 'string') {
        updatedFullRagData[section] = text;
      } else if (Object.prototype.hasOwnProperty.call(updatedFullRagData, section) && Array.isArray(updatedFullRagData[section])) {
        updatedFullRagData[section] = [text];
      }

      return {
        ragData: updatedRagData,
        fullRagData: updatedFullRagData,
      };
    }),

  collectionFiles: [],
  addToCollectionFiles: (filesToAdd) =>
    set((state) => {
      const currentCollectionFileNames = new Set(
        state.collectionFiles.map(file => file.name)
      );
      const newFiles = filesToAdd.filter(
        file => !currentCollectionFileNames.has(file.name)
      );
      return {
        collectionFiles: [...state.collectionFiles, ...newFiles],
      };
    }),
}));

export const useSessionFileStore = sessionFileStore;

export const sessionFileStorePlain: StoreApi<SessionFileStoreState> = sessionFileStore;