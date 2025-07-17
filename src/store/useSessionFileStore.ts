import { BackendCollection, UploadedFile } from "@/types/files";
import { UploadedFile, BackendCollection } from "@/types/files";
import { create, StoreApi } from "zustand";

export interface Collection {
  id: string;
  name: string;
  files: UploadedFile[];
  isExpanded?: boolean;
  isIngested?: boolean;
  isActive?: boolean;
}

export interface SessionFileStoreState {
  sessionId: string | null;
  loadingSession: boolean;
  previewCsv: string | null;
  previewFile: UploadedFile | null;
  selectedFiles: UploadedFile[];
  lastClearedTimestamp: number;
  setSessionId: (id: string | null) => void;
  setLoadingSession: (loading: boolean) => void;
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

  collections: Collection[];
  activeCollectionId: string | null;
  addCollection: (files: UploadedFile[], name?: string) => void;
  removeCollection: (collectionId: string) => void;
  renameCollection: (collectionId: string, newName: string) => void;
  toggleCollectionExpanded: (collectionId: string) => void;
  getCollectionFiles: (collectionId: string) => UploadedFile[];
  getAllCollectionFiles: () => UploadedFile[];
  setActiveCollection: (collectionId: string | null) => void;
  setCollections: (collections: Collection[]) => void;
  markCollectionAsIngested: (collectionId: string) => void;
  fetchCollections: () => Promise<void>;

  collectionFiles: UploadedFile[];
  addToCollectionFiles: (filesToAdd: UploadedFile[]) => void;

  clearAllFiles: () => void;
}

const sessionFileStore = create<SessionFileStoreState>((set, get) => ({
  sessionId: null,
  loadingSession: false,
  setLoadingSession: (loading) => set({ loadingSession: loading }),
  previewCsv: null,
  previewFile: null,
  selectedFiles: [],
  lastClearedTimestamp: 0,
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
        if (typeof value === "string") {
          newRagData[key] = value;
        } else if (Array.isArray(value)) {
          newRagData[key] = value.join(", ");
        } else if (value !== null && value !== undefined) {
          newRagData[key] = String(value);
        } else {
          newRagData[key] = "";
        }
      }
    }
    console.log(
      "Zustand Store: Setting fullRagData and derived ragData",
      data,
      newRagData
    );
    set({ fullRagData: data, ragData: newRagData });
  },

  ragData: {},
  setRagData: (data) => set({ ragData: data }),
  updateRagSection: (section, text) =>
    set((state) => {
      const updatedRagData = { ...state.ragData, [section]: text };
      const updatedFullRagData = { ...state.fullRagData };
      if (
        Object.prototype.hasOwnProperty.call(updatedFullRagData, section) &&
        typeof updatedFullRagData[section] === "string"
      ) {
        updatedFullRagData[section] = text;
      } else if (
        Object.prototype.hasOwnProperty.call(updatedFullRagData, section) &&
        Array.isArray(updatedFullRagData[section])
      ) {
        updatedFullRagData[section] = [text];
      }

      return {
        ragData: updatedRagData,
        fullRagData: updatedFullRagData,
      };
    }),

  collections: [],
  activeCollectionId: null,
  addCollection: (files, name) =>
    set((state) => {
      const collectionNumber = state.collections.length + 1;
      const newCollection: Collection = {
        id: Date.now().toString(),
        name: name || `Collection ${collectionNumber}`,
        files,
        isExpanded: true,
      };
      return {
        collections: [...state.collections, newCollection],
        collectionFiles: [...state.collectionFiles, ...files],
      };
    }),
  removeCollection: (collectionId) =>
    set((state) => {
      const newCollections = state.collections.filter(
        (c) => c.id !== collectionId
      );
      return {
        collections: newCollections,
      };
    }),
  renameCollection: (collectionId, newName) =>
    set((state) => {
      const newCollections = state.collections.map((c) =>
        c.id === collectionId ? { ...c, name: newName } : c
      );
      return {
        collections: newCollections,
      };
    }),
  toggleCollectionExpanded: (collectionId) =>
    set((state) => {
      const newCollections = state.collections.map((c) =>
        c.id === collectionId ? { ...c, isExpanded: !c.isExpanded } : c
      );
      return {
        collections: newCollections,
      };
    }),
  getCollectionFiles: (collectionId) =>
    get().collections.find((c) => c.id === collectionId)?.files || [],
  getAllCollectionFiles: () =>
    get().collections.reduce(
      (acc: UploadedFile[], c) => [...acc, ...c.files],
      [] as UploadedFile[]
    ),
  setActiveCollection: (collectionId) =>
    set({ activeCollectionId: collectionId }),
  setCollections: (collections) => set({ collections }),
  markCollectionAsIngested: (collectionId) =>
    set((state) => {
      const newCollections = state.collections.map((c) =>
        c.id === collectionId ? { ...c, isIngested: true } : c
      );
      return {
        collections: newCollections,
      };
    }),
  fetchCollections: async () => {
    try {
      set({ loadingSession: true });
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"
        }/api/collections`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        set((state) => {
          // Merge backend data with existing frontend state
          const existingCollections = state.collections;
          const backendCollections = data.collections;

          const mergedCollections = backendCollections.map(
            (backendColl: BackendCollection) => {
              const existingColl = existingCollections.find(
                (c) => c.id === backendColl.id
              );

              return {
                id: backendColl.id,
                name: backendColl.name,
                files: backendColl.files || [], // Backend now provides proper file objects
                isExpanded:
                  existingColl?.isExpanded ?? backendColl.id === "default",
                isIngested: true, // If it exists on backend, it's ingested
                isActive: backendColl.is_active,
              };
            }
          );

          return {
            collections: mergedCollections,
            activeCollectionId:
              data.collections.find((c: BackendCollection) => c.is_active)
                ?.id || null,
            sessionId: data.session_id, // Store the session ID from the backend
          };
        });
      }
    } catch (error) {
      console.error("Failed to fetch collections:", error);
    } finally {
      set({ loadingSession: false });
    }
  },

  collectionFiles: [],
  addToCollectionFiles: (filesToAdd) =>
    set((state) => {
      const collectionNumber = state.collections.length + 1;
      const newCollection: Collection = {
        id: Date.now().toString(),
        name: `Collection ${collectionNumber}`,
        files: filesToAdd,
        isExpanded: true,
      };

      const currentCollectionFileNames = new Set(
        state.collectionFiles.map((file) => file.name)
      );
      const newFiles = filesToAdd.filter(
        (file) => !currentCollectionFileNames.has(file.name)
      );
      return {
        collections: [...state.collections, newCollection],
        collectionFiles: [...state.collectionFiles, ...newFiles],
      };
    }),

  clearAllFiles: () =>
    set(() => {
      return {
        selectedFiles: [],
        previewCsv: null,
        previewFile: null,
        collectionFiles: [],
        collections: [],
        activeCollectionId: null, // No active collection = default chat mode
        ragData: {},
        fullRagData: {},
        lastClearedTimestamp: Date.now(),
      };
    }),
}));

export const useSessionFileStore = sessionFileStore;

export const sessionFileStorePlain: StoreApi<SessionFileStoreState> =
  sessionFileStore;
