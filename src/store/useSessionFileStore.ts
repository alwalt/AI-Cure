import { create } from "zustand";
import { UploadedFile } from "@/types/files";

interface SessionFileStoreState {
  sessionId: string | null;
  previewCsv: string | null;
  previewFile: UploadedFile | null;
  selectedFiles: UploadedFile[]; // ✅ Add this
  setSessionId: (id: string) => void;
  setPreviewCsv: (filename: string | null) => void;
  setPreviewFile: (file: UploadedFile | null) => void;
  setSelectedFiles: (
    files: UploadedFile[] | ((prev: UploadedFile[]) => UploadedFile[])
  ) => void; // ✅ Add this
  handlePreview: (csvFilename: string, currentSessionId: string) => void;
  handleFilePreview: (file: UploadedFile | null) => void;
}

export const useSessionFileStore = create<SessionFileStoreState>((set) => ({
  sessionId: null,
  previewCsv: null,
  previewFile: null,
  selectedFiles: [], // ✅ Initialize it as an empty array
  setSessionId: (id) => set({ sessionId: id }),
  setPreviewCsv: (filename) => set({ previewCsv: filename }),
  setPreviewFile: (file) => set({ previewFile: file }),

  setSelectedFiles: (files) =>
    set((state) => ({
      selectedFiles:
        typeof files === "function" ? files(state.selectedFiles) : files,
    })), // ✅ Allow function updates

  handlePreview: (csvFilename, currentSessionId) => {
    set({
      previewCsv: csvFilename,
      sessionId: currentSessionId,
      previewFile: null,
    });
  },

  handleFilePreview: (file) => {
    set({
      previewFile: file,
      previewCsv: null,
    });
  },
}));
