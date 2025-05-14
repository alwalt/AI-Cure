import { create } from "zustand";
import { UploadedFile } from "@/types/files";

interface SessionFileStoreState {
  sessionId: string | null;
  previewCsv: string | null;
  previewFile: UploadedFile | null;
  selectedFiles: UploadedFile[]; // Add this
  setSessionId: (id: string) => void;
  setPreviewCsv: (filename: string | null) => void;
  setPreviewFile: (file: UploadedFile | null) => void;
  setSelectedFiles: (
    files: UploadedFile[] | ((prev: UploadedFile[]) => UploadedFile[])
  ) => void; //  Add this
  handlePreview: (csvFilename: string) => void;
  handleFilePreview: (file: UploadedFile | null) => void;
  // NEW for RAG:
  ragData: Record<string, string>; // e.g. { description: "...", studies: "...", ... }
  setRagData: (data: Record<string, string>) => void;
  updateRagSection: (section: string, text: string) => void;
  fullRagData: Record<string, string>;
  setFullRagData: (data: Record<string, string>) => void;
}

export const useSessionFileStore = create<SessionFileStoreState>((set) => ({
  sessionId: null,
  previewCsv: null,
  previewFile: null,
  selectedFiles: [], // Initialize it as an empty array
  setSessionId: (id) => set({ sessionId: id }),
  setPreviewCsv: (filename) => set({ previewCsv: filename }),
  setPreviewFile: (file) => set({ previewFile: file }),

  setSelectedFiles: (files) =>
    set((state) => ({
      selectedFiles:
        typeof files === "function" ? files(state.selectedFiles) : files,
    })), //  Allow function updates

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
  // full rag obj
  fullRagData: {},
  setFullRagData: (data) => set({ fullRagData: data }),

  // RAG slice
  ragData: {},
  setRagData: (data) => set({ ragData: data }),
  updateRagSection: (section, text) =>
    set((state) => ({
      ragData: { ...state.ragData, [section]: text },
    })),
}));
