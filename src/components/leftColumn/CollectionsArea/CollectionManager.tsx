import { useState } from "react";
import axios from "axios";
import SaveButton from "@/components/base/SaveButton";
import { useSessionFileStore } from "@/store/useSessionFileStore";
import { UploadedFile, IngestResponse } from "@/types/files";
import { apiBase } from "@/lib/api";

export default function CollectionManager() {
  const collectionFiles = useSessionFileStore((state) => state.collectionFiles);
  const setSessionId = useSessionFileStore((state) => state.setSessionId);

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleIngestFiles = async () => {
    if (collectionFiles.length === 0) {
      alert("Please add files to the collection first.");
      return;
    }

    setIsLoading(true);
    setStatusMessage("Ingesting files...");

    const filesToIngest: File[] = collectionFiles
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
      console.log("Ingestion successful. Session ID:", newSessionId);
      
      setSessionId(newSessionId);

      setStatusMessage("Files ingested successfully!");
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

  return (
    <div className="space-y-2">
      <div className="flex justify-between w-full">
        <h2 className="text-2xl font-bold text-primaryWhite">Collections</h2>
        <SaveButton />
      </div>
      <div className="min-h-[200px] border-grey border rounded bg-black p-2 flex flex-col justify-between">
        <div className="flex-grow overflow-y-auto">
          {collectionFiles.length === 0 && !isLoading ? (
            <p className="p-2 text-gray-400">No files in collection yet.</p>
          ) : collectionFiles.length > 0 && !isLoading ? (
            <ul className="space-y-1">
              {collectionFiles.map((file: UploadedFile) => (
                <li
                  key={file.name}
                  className="text-sm text-primaryWhite bg-unSelectedBlack p-2 rounded border border-grey"
                >
                  {file.name} ({file.type})
                </li>
              ))}
            </ul>
          ) : null }
          {isLoading && (
            <div className="p-2 text-primaryWhite text-center">
              <p>{statusMessage || "Processing..."}</p>
            </div>
          )}
           {!isLoading && statusMessage && collectionFiles.length > 0 && (
            <div className="p-2 text-primaryWhite text-center mt-2">
              <p>{statusMessage}</p>
            </div>
          )}
        </div>

        {collectionFiles.length > 0 && (
          <div className="mt-2 pt-2 border-t border-grey">
            <button
              onClick={handleIngestFiles}
              disabled={isLoading}
              className={`w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-primaryWhite rounded transition-colors ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Ingesting..." : "Ingest files"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
