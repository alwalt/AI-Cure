import SaveButton from "@/components/base/SaveButton";
import { apiBase } from "@/lib/api";
import { Collection, useSessionFileStore } from "@/store/useSessionFileStore";
import { IngestResponse, UploadedFile } from "@/types/files";
import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { useEffect, useState } from "react";

export default function CollectionManager() {
  const collections = useSessionFileStore((state) => state.collections);
  const activeCollectionId = useSessionFileStore(
    (state) => state.activeCollectionId
  );
  const sessionId = useSessionFileStore((state) => state.sessionId);
  const removeCollection = useSessionFileStore(
    (state) => state.removeCollection
  );
  const renameCollection = useSessionFileStore(
    (state) => state.renameCollection
  );
  const toggleCollectionExpanded = useSessionFileStore(
    (state) => state.toggleCollectionExpanded
  );
  const setSessionId = useSessionFileStore((state) => state.setSessionId);
  const setActiveCollection = useSessionFileStore(
    (state) => state.setActiveCollection
  );
  const markCollectionAsIngested = useSessionFileStore(
    (state) => state.markCollectionAsIngested
  );
  const fetchCollections = useSessionFileStore(
    (state) => state.fetchCollections
  );

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [editingCollection, setEditingCollection] = useState<string | null>(
    null
  );
  const [editingName, setEditingName] = useState("");

  // Fetch collections when component mounts to load default collection
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleIngestCollection = async (collection: Collection) => {
    if (collection.files.length === 0) {
      alert("This collection has no files to ingest.");
      return;
    }

    setIsLoading(true);
    setStatusMessage(`Creating vectorstore for "${collection.name}"...`);

    const filesToIngest: File[] = collection.files
      .map((cf) => cf.file)
      .filter((f): f is File => f !== undefined);

    if (filesToIngest.length === 0) {
      setStatusMessage(
        "Error: No actual file data found in collection for ingestion."
      );
      setIsLoading(false);
      return;
    }

    const ingestForm = new FormData();
    filesToIngest.forEach((file) => {
      ingestForm.append("files", file);
    });
    ingestForm.append("collection_id", collection.id);
    ingestForm.append("collection_name", collection.name);
    ingestForm.append(
      "embedding_model",
      "sentence-transformers/all-MiniLM-L6-v2"
    );

    try {
      const ingestResp = await axios.post<IngestResponse>(
        `${apiBase}/api/ingest`,
        ingestForm,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const newSessionId = ingestResp.data.session_id;
      console.log(
        `Ingestion successful for "${collection.name}". Session ID:`,
        newSessionId
      );

      setSessionId(newSessionId);
      setActiveCollection(collection.id);
      markCollectionAsIngested(collection.id);

      setStatusMessage(
        `"${collection.name}" ingested successfully! This collection is now active.`
      );
    } catch (err) {
      console.error("Failed to ingest files:", err);
      setStatusMessage(
        `Error during file ingestion: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleLoadCollection = async (collection: Collection) => {
    if (!collection.isIngested) {
      alert("Collection must be ingested first. Click the 'Ingest' button.");
      return;
    }

    setIsLoading(true);
    setStatusMessage(`Loading "${collection.name}"...`);

    try {
      await axios.post(
        `${apiBase}/api/collections/${collection.id}/load`,
        {},
        { withCredentials: true }
      );

      setActiveCollection(collection.id);

      setStatusMessage(`Creating chatbot for "${collection.name}"...`);

      await axios.post(
        `${apiBase}/api/create_chatbot/${sessionId}`,
        {
          model_name: "llama3.1",
          chat_prompt:
            "You are a helpful AI assistant that answers questions based on the provided documents.",
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      setStatusMessage(
        `"${collection.name}" loaded! Chatbot ready for questions.`
      );
    } catch (err) {
      console.error("Failed to load collection or create chatbot:", err);
      setStatusMessage(
        `Error loading collection: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleExportCollection = async (collection: Collection) => {
    if (!collection.isIngested) {
      alert("Collection must be ingested first before it can be exported.");
      return;
    }

    try {
      const response = await axios.get(
        `${apiBase}/api/collections/${collection.id}/export`,
        {
          withCredentials: true,
          responseType: "blob",
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${collection.name}_${collection.id}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setStatusMessage(`"${collection.name}" exported successfully!`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error("Failed to export collection:", err);
      setStatusMessage(
        `Error exporting collection: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleDeleteCollection = async (collection: Collection) => {
    if (
      !confirm(
        `Are you sure you want to delete "${collection.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await axios.delete(`${apiBase}/api/collections/${collection.id}`, {
        withCredentials: true,
      });

      removeCollection(collection.id);

      if (activeCollectionId === collection.id) {
        setActiveCollection(null);
      }

      setStatusMessage(`"${collection.name}" deleted successfully.`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error("Failed to delete collection:", err);
      setStatusMessage(
        `Error deleting collection: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleRenameCollection = async (
    collectionId: string,
    newName: string
  ) => {
    // Check if collection is ingested
    const collection = collections.find((c) => c.id === collectionId);

    if (!collection?.isIngested) {
      // For non-ingested collections, rename locally only
      renameCollection(collectionId, newName);
      setStatusMessage(
        `Collection renamed to "${newName}" (will sync after ingestion).`
      );
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    // For ingested collections, update backend
    try {
      await axios.put(
        `${apiBase}/api/collections/${collectionId}`,
        { new_name: newName },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      renameCollection(collectionId, newName);
      setStatusMessage(`Collection renamed to "${newName}" successfully.`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error("Failed to rename collection:", err);
      setStatusMessage(
        `Error renaming collection: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const startEditing = (collection: Collection) => {
    setEditingCollection(collection.id);
    setEditingName(collection.name);
  };

  const saveEdit = () => {
    if (editingCollection && editingName.trim()) {
      handleRenameCollection(editingCollection, editingName.trim());
    }
    setEditingCollection(null);
    setEditingName("");
  };

  const cancelEdit = () => {
    setEditingCollection(null);
    setEditingName("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  return (
    <div className="space-y-2 last:mb-0">
      <div className="flex justify-between w-full overflow-hidden">
        <h2 className="text-2xl font-bold text-primaryWhite">Collections</h2>
        <SaveButton />
      </div>
      <div className="min-h-[200px] border-grey border rounded bg-unSelectedBlack pt-2 pr-2 pl-2 pb-2">
        {/* React Query Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-primaryWhite">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-selectedBlue mx-auto mb-2"></div>
              <p>Loading collections...</p>
            </div>
          </div>
        )}

        {/* Collections Content */}
        {!isLoading && (
          <>
            {collections.length === 0 ? (
              <p className="p-2 text-gray-400">
                No collections yet. Add files to create your first collection.
              </p>
            ) : (
              <div className="space-y-2 last:mb-0">
                {collections.map((collection: Collection) => (
                  <div
                    key={collection.id}
                    className={`border border-grey rounded bg-unSelectedBlack ${
                      activeCollectionId === collection.id
                        ? "ring-2 ring-selectedBlue"
                        : ""
                    }`}
                  >
                    {/* Collection Header */}
                    <div className="flex items-center justify-between p-2 bg-primaryBlack text-primaryWhite rounded-t border-b border-grey">
                      <div className="flex items-center gap-2 flex-1">
                        <button
                          onClick={() =>
                            toggleCollectionExpanded(collection.id)
                          }
                          className="p-1 hover:bg-grey rounded transition-colors duration-200"
                        >
                          {collection.isExpanded ? (
                            <ChevronDownIcon className="h-4 w-4" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4" />
                          )}
                        </button>

                        {editingCollection === collection.id ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={handleKeyPress}
                            className="bg-primaryBlack text-primaryWhite px-2 py-1 rounded border border-grey flex-1 focus:border-primaryWhite focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <span className="flex-1 font-medium">
                            {collection.name}
                          </span>
                        )}

                        <span className="text-xs text-gray-400">
                          {collection.files.length} file
                          {collection.files.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditing(collection)}
                          className="p-1 hover:bg-grey rounded transition-colors duration-200"
                          title="Rename collection"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>

                        {collection.isIngested && (
                          <button
                            onClick={() => handleExportCollection(collection)}
                            className="p-1 hover:bg-selectedBlue rounded transition-colors duration-200"
                            title="Export collection"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </button>
                        )}

                        {collection.id !== "default" && (
                          <button
                            onClick={() => handleDeleteCollection(collection)}
                            className="p-1 hover:bg-redFill rounded transition-colors duration-200"
                            title="Delete collection"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Collection Content */}
                    {collection.isExpanded && (
                      <div className="p-2">
                        {collection.files.length > 0 ? (
                          <>
                            <ul className="space-y-1 mb-3 last:mb-0">
                              {collection.files.map((file: UploadedFile) => (
                                <li
                                  key={file.name}
                                  className="text-sm text-primaryWhite bg-primaryBlack p-2 rounded border border-grey hover:bg-grey transition-colors duration-200"
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{file.name}</span>
                                    <span className="text-xs text-gray-400">
                                      {file.type}
                                    </span>
                                  </div>
                                </li>
                              ))}
                            </ul>

                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleIngestCollection(collection)
                                }
                                disabled={isLoading || collection.isIngested}
                                className={`flex-1 px-4 py-2 rounded transition-colors duration-200 ${
                                  collection.isIngested
                                    ? "bg-green-600 text-primaryWhite cursor-not-allowed"
                                    : "bg-primaryBlue hover:bg-selectedBlue text-primaryWhite"
                                } ${
                                  isLoading
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                {collection.isIngested
                                  ? "Ingested"
                                  : "Ingest Collection"}
                              </button>

                              {collection.isIngested && (
                                <button
                                  onClick={() =>
                                    handleLoadCollection(collection)
                                  }
                                  disabled={
                                    isLoading ||
                                    activeCollectionId === collection.id
                                  }
                                  className={`flex-1 px-4 py-2 rounded transition-colors duration-200 ${
                                    activeCollectionId === collection.id
                                      ? "bg-selectedBlue text-primaryWhite cursor-not-allowed"
                                      : "bg-grey hover:bg-selectedBlue text-primaryWhite"
                                  } ${
                                    isLoading
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  {activeCollectionId === collection.id
                                    ? "Active"
                                    : "Load"}
                                </button>
                              )}
                            </div>
                          </>
                        ) : collection.id === "default" ? (
                          <div className="text-center py-4">
                            <p className="text-primaryWhite text-sm mb-2">
                              Default chat collection - ready for general
                              conversation
                            </p>
                            <p className="text-gray-400 text-xs">
                              {activeCollectionId === collection.id
                                ? "Currently active - you can chat now!"
                                : "No document context, but chatbot is available"}
                            </p>
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm text-center py-2">
                            No files in this collection.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {statusMessage && (
          <div
            className={`p-2 text-primaryWhite text-center mt-2 rounded ${
              statusMessage.includes("Error") || statusMessage.includes("error")
                ? "bg-redFill"
                : isLoading
                ? "bg-primaryBlue"
                : "bg-grey"
            }`}
          >
            <p>{statusMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
