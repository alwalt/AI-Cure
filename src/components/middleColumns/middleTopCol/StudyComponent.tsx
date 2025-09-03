"use client";
import CollapsibleSection from "@/components/base/CollapsibleSection";
import { generateSingleRag } from "@/lib/ragClient";
import {
  SessionFileStoreState,
  useSessionFileStore,
} from "@/store/useSessionFileStore";
import useAssaysStore from "@/store/useAssaysStore";

import { useState } from "react";
// import { generateWithTemplate, generateSingleRag } from "@/lib/ragClient";
// import { RagResponse, UploadedFile } from "@/types/files";
import { UploadedFile } from "@/types/files";

export default function StudyComponent() {
  const [loadingSection, setLoadingSection] = useState<string | null>(null);

  const collections = useSessionFileStore(
    (state: SessionFileStoreState) => state.collections
  );
  const activeCollectionId = useSessionFileStore(
    (state: SessionFileStoreState) => state.activeCollectionId
  );
  const sessionId = useSessionFileStore(
    (state: SessionFileStoreState) => state.sessionId
  );
  // const setFullRagData = useSessionFileStore(
  //   (state: SessionFileStoreState) => state.setFullRagData
  // );
  const ragData = useSessionFileStore(
    (state: SessionFileStoreState) => state.ragData
  );
  const updateRagSection = useSessionFileStore(
    (state: SessionFileStoreState) => state.updateRagSection
  );

  const setAssayTitles = useAssaysStore((state) => state.setAssayTitles);

  const CollapsibleSectionTitles = [
    "description",
    "title",
    "keywords",
    "assays",
  ];

  const activeCollection = collections.find((c) => c.id === activeCollectionId);

  const onGenerate = async (sectionToLoad: string) => {
    if (!sessionId) {
      console.error(
        "StudyComponent: No active session ID. Cannot generate RAG data."
      );
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

    const fileNamesForRAG = activeCollection.files.map(
      (file: UploadedFile) => file.name
    );
    console.log(
      "StudyComponent: Calling RAG generation for section:",
      sectionToLoad,
      "with fileNames from active collection:",
      fileNamesForRAG
    );
    console.log(
      "StudyComponent: Using active collection:",
      activeCollection.name
    );

    setLoadingSection(sectionToLoad);
    try {
      // new per-section call
      const result = await generateSingleRag(
        sectionToLoad as "description" | "title" | "keywords" | "assays",
        fileNamesForRAG,
        sessionId
      );

      // Debug logging to see what we actually got
      console.log(
        "StudyComponent: Raw result from generateSingleRag:",
        result,
        typeof result
      );

      // Handle different result types
      let textResult: string;
      let titlesArray: string[];

      if (sectionToLoad === "assays") {
        if (Array.isArray(result)) {
          // Backend returns List[str] - result is already an array
          titlesArray = result as string[];
          textResult = titlesArray.join(", ");
        } else if (typeof result === "string") {
          // Backend returns str - need to parse
          textResult = result;
          titlesArray = textResult.split(",").map((title) => title.trim());
        } else {
          throw new Error(`Unexpected assays result type: ${typeof result}`);
        }

        // Store in AssaysStore
        setAssayTitles(titlesArray);
        console.log(
          "StudyComponent: Stored assay titles in AssaysStore:",
          titlesArray
        );
      } else if (sectionToLoad === "keywords" && Array.isArray(result)) {
        // Handle keywords array
        textResult = result.join(", ");
      } else {
        // Handle other sections (description, title)
        textResult = result as string;
      }

      // Update the main RAG data store for the text area
      updateRagSection(sectionToLoad, textResult);
    } catch (error) {
      console.error("StudyComponent: Error generating RAG data:", error);
      alert(
        `Error generating data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoadingSection(null);
    }
  };

  return (
    <div className="w-full overflow-auto">
      {/* Active Collection Info */}
      {activeCollection ? (
        <div className="mb-4 p-3 bg-selectedBlack border border-selectedBlue rounded">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-selectedBlue">
                Active Collection
              </h3>
              <p className="text-primaryWhite">{activeCollection.name}</p>
              <p className="text-xs text-brightGrey">
                {activeCollection.files.length} file
                {activeCollection.files.length !== 1 ? "s" : ""} loaded
              </p>
            </div>
            <div className="text-xs bg-selectedBlue px-2 py-1 rounded text-primaryWhite">
              READY FOR RAG
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-selectedBlack border border-grey rounded">
          <h3 className="text-sm font-semibold text-brightGrey">
            No Active Collection
          </h3>
          <p className="text-primaryWhite text-sm">
            Please ingest and load a collection to generate study content.
          </p>
          <p className="text-xs text-brightGrey mt-1">
            You can still chat with the bot using general knowledge below.
          </p>
        </div>
      )}

      <div className="flex flex-col overflow-hidden">
        {CollapsibleSectionTitles.map((sectionTitle) => (
          <CollapsibleSection
            key={sectionTitle}
            title={sectionTitle}
            onGenerate={() => onGenerate(sectionTitle)}
            value={ragData[sectionTitle] || ""}
            onChange={(txt) => updateRagSection(sectionTitle, txt)}
            isLoading={loadingSection === sectionTitle}
            disabled={!activeCollection} // Disable if no active collection
          />
        ))}
      </div>
    </div>
  );
}
