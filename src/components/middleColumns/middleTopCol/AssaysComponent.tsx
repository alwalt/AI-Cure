// Add these imports if not already present
import {
  useSessionFileStore,
  SessionFileStoreState,
} from "@/store/useSessionFileStore";
import { generateSingleRag } from "@/lib/ragClient";
import { UploadedFile } from "@/types/files";
import { useState } from "react";
import CollapsibleSection from "@/components/base/CollapsibleSection";

// In your component where you're using the single CollapsibleSection:
export default function AssaysComponent() {
  const [isAssaysLoading, setIsAssaysLoading] = useState(false);
  const [isAssaysSectionOpen, setIsAssaysSectionOpen] = useState(true);

  // Get the same store values as StudyComponent
  const collections = useSessionFileStore(
    (state: SessionFileStoreState) => state.collections
  );
  const activeCollectionId = useSessionFileStore(
    (state: SessionFileStoreState) => state.activeCollectionId
  );
  const sessionId = useSessionFileStore(
    (state: SessionFileStoreState) => state.sessionId
  );
  const ragData = useSessionFileStore(
    (state: SessionFileStoreState) => state.ragData
  );
  const updateRagSection = useSessionFileStore(
    (state: SessionFileStoreState) => state.updateRagSection
  );

  // Get the active collection (same as StudyComponent)
  const activeCollection = collections.find((c) => c.id === activeCollectionId);

  const handleAssaysGenerate = async () => {
    if (!sessionId) {
      console.error("No active session ID. Cannot generate RAG data.");
      alert(
        "Please ingest files into a collection first to establish a session."
      );
      return;
    }

    if (!activeCollectionId) {
      alert("No active collection found. Please load a collection first.");
      return;
    }

    if (!activeCollection) {
      alert("Active collection not found. Please reload the page.");
      return;
    }

    // Get file names from active collection (same as StudyComponent)
    const fileNamesForRAG = activeCollection.files.map(
      (file: UploadedFile) => file.name
    );

    console.log(
      "Calling RAG generation for assays with files:",
      fileNamesForRAG
    );

    setIsAssaysLoading(true);
    try {
      const result = await generateSingleRag(
        "assays" as "description" | "title" | "keywords" | "assays",
        fileNamesForRAG,
        sessionId
      );

      // Handle the result (assuming assays returns a string, adjust if it's an array)
      const textResult = Array.isArray(result)
        ? result.join(", ")
        : (result as string);

      updateRagSection("assays", textResult);
    } catch (error) {
      console.error("Error generating assays data:", error);
      alert(
        `Error generating assays data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsAssaysLoading(false);
    }
  };

  return (
    <div className="w-full overflow-auto">
      {/* You can include the same active collection info display if needed */}

      <CollapsibleSection
        title="assays"
        onGenerate={handleAssaysGenerate}
        value={ragData["assays"] || ""}
        onChange={(txt) => updateRagSection("assays", txt)}
        isLoading={isAssaysLoading}
        disabled={!activeCollection}
        initiallyOpen={isAssaysSectionOpen}
      />
    </div>
  );
}
