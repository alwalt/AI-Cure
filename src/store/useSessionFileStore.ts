import { create } from "zustand";

interface SessionFileState {
  sessionId: string;
  previewCsv: string | undefined;
  setSessionId: (id: string) => void;
  setPreviewCsv: (csvFilename: string | undefined) => void;
}

export const useSessionFileStore = create<SessionFileState>(
  (set: (state: Partial<SessionFileState>) => void) => ({
    sessionId: "",
    previewCsv: undefined,
    setSessionId: (id: string) => set({ sessionId: id }),
    setPreviewCsv: (csvFilename: string | undefined) =>
      set({ previewCsv: csvFilename }),
  })
);
