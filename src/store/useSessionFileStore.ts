import { create } from "zustand";
import { UploadedFile } from "@/types/files";

interface SessionFileStoreState {
  sessionId: string | null;
  previewCsv: string | null;
  previewFile: UploadedFile | null;
  selectedFiles: UploadedFile[];
  setSessionId: (id: string) => void;
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
  fullRagData: Record<string, string>;
  setFullRagData: (data: Record<string, string>) => void;

  collectionFiles: UploadedFile[];
  addToCollectionFiles: (filesToAdd: UploadedFile[]) => void;
}

export const useSessionFileStore = create<SessionFileStoreState>((set) => ({
  sessionId: null,
  previewCsv: null,
  previewFile: null,
  selectedFiles: [],
  setSessionId: (id) => set({ sessionId: id }),
  setPreviewCsv: (filename) => set({ previewCsv: filename }),
  setPreviewFile: (file) => set({ previewFile: file }),

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
  setFullRagData: (data) => set({ fullRagData: data }),

  ragData: {},
  setRagData: (data) => set({ ragData: data }),
  updateRagSection: (section, text) =>
    set((state) => ({
      ragData: { ...state.ragData, [section]: text },
    })),

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