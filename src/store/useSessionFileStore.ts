import { create } from "zustand";
import { UploadedFile } from "@/types/files";

interface SessionFileState {
  sessionId: string;
  previewCsv?: string;
  previewFile: UploadedFile | null;
  setSessionId: (id: string) => void;
  setPreviewCsv: (filename?: string) => void;
  setPreviewFile: (file: UploadedFile | null) => void;
}

export const useSessionFileStore = create<SessionFileState>((set) => ({
  sessionId: "",
  previewCsv: undefined,
  previewFile: null,
  setSessionId: (id) => set({ sessionId: id }),
  setPreviewCsv: (filename) => set({ previewCsv: filename }),
  setPreviewFile: (file) =>
    set((state) => ({
      previewFile: file,
      // If a file is set, clear CSV preview
      previewCsv: file ? undefined : state.previewCsv,
    })),
}));
