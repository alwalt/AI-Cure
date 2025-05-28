import { useState } from "react";
import axios from "axios";
import SaveButton from "@/components/base/SaveButton";
import { useSessionFileStore, Collection } from "@/store/useSessionFileStore";
import { UploadedFile, IngestResponse } from "@/types/files";
import { apiBase } from "@/lib/api";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export default function CollectionManager() {
  const collections = useSessionFileStore((state) => state.collections);
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

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [editingCollection, setEditingCollection] = useState<string | null>(
    null
  );
  const [editingName, setEditingName] = useState("");

  const handleIngestCollection = async (collection: Collection) => {
    if (collection.files.length === 0) {
      alert("This collection has no files to ingest.");
      return;
    }

    setIsLoading(true);
    setStatusMessage(`Ingesting files from "${collection.name}"...`);

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

      setStatusMessage(
        `Files from "${collection.name}" ingested successfully!`
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

  const startEditing = (collection: Collection) => {
    setEditingCollection(collection.id);
    setEditingName(collection.name);
  };

  const saveEdit = () => {
    if (editingCollection && editingName.trim()) {
      renameCollection(editingCollection, editingName.trim());
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
      <div className="flex justify-between w-full">
        <h2 className="text-2xl font-bold text-primaryWhite">Collections</h2>
        <SaveButton />
      </div>
      <div className="min-h-[200px] border-grey border rounded bg-unSelectedBlack pt-2 pr-2 pl-2 pb-0">
        {collections.length === 0 && !isLoading ? (
          <p className="p-2 text-gray-400">
            No collections yet. Add files to create your first collection.
          </p>
        ) : (
          <div className="space-y-2 last:mb-0">
            {collections.map((collection: Collection) => (
              <div
                key={collection.id}
                className="border border-grey rounded bg-unSelectedBlack"
              >
                {/* Collection Header */}
                <div className="flex items-center justify-between p-2 bg-primaryBlack text-primaryWhite rounded-t border-b border-grey">
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      onClick={() => toggleCollectionExpanded(collection.id)}
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
                    <button
                      onClick={() => removeCollection(collection.id)}
                      className="p-1 hover:bg-red-600 rounded transition-colors duration-200"
                      title="Delete collection"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
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

                        <button
                          onClick={() => handleIngestCollection(collection)}
                          disabled={isLoading}
                          className={`w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-primaryWhite rounded transition-colors duration-200 ${
                            isLoading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {isLoading
                            ? "Loading..."
                            : `Load "${collection.name}"`}
                        </button>
                      </>
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

        {isLoading && statusMessage && (
          <div className="p-2 text-primaryWhite text-center mt-2 bg-primaryBlue rounded">
            <p>{statusMessage}</p>
          </div>
        )}

        {!isLoading && statusMessage && (
          <div className="p-2 text-primaryWhite text-center mt-2 bg-green-600 rounded">
            <p>{statusMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
