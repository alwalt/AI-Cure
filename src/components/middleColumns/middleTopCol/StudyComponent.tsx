"use client";
import CollapsibleSection from "@/components/base/CollapsibleSection";
import EditableTextArea from "@/components/base/EditableTextArea";
import { generateSingleRag } from "@/lib/ragClient";
import {
  SessionFileStoreState,
  useSessionFileStore,
} from "@/store/useSessionFileStore";
import useAssaysStore from "@/store/useAssaysStore";

import { useState } from "react";
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
    "experiments",
    "payloads",
    "protocols",
    "samples",
    "publications",
    "files",
    "version history",
    "visualization",
  ];

  const activeCollection = collections.find((c) => c.id === activeCollectionId);

  // Updated to accept sectionId parameter
  const onGenerate = async (sectionId: string) => {
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
      sectionId,
      "with fileNames from active collection:",
      fileNamesForRAG
    );
    console.log(
      "StudyComponent: Using active collection:",
      activeCollection.name
    );

    setLoadingSection(sectionId);
    try {
      // new per-section call
      const result = await generateSingleRag(
        sectionId as "description" | "title" | "keywords" | "assays",
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

      if (sectionId === "assays") {
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
      } else if (sectionId === "keywords" && Array.isArray(result)) {
        // Handle keywords array
        textResult = result.join(", ");
      } else {
        // Handle other sections (description, title)
        textResult = result as string;
      }

      // Update the main RAG data store for the text area
      updateRagSection(sectionId, textResult);
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

  // Updated to accept sectionId parameter
  const handleTextChange = (sectionId: string, newValue: string) => {
    updateRagSection(sectionId, newValue);
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

      <div className="flex flex-col overflow-hidden space-y-4">
        {/* Description Section - Traditional layout with textarea inside */}
        <CollapsibleSection
          title="description"
          sectionId="description"
          onGenerate={onGenerate}
          isLoading={loadingSection === "description"}
          disabled={!activeCollection}
          initiallyOpen={true}
        >
          <EditableTextArea
            sectionId="description"
            value={ragData["description"] || ""}
            onChange={handleTextChange}
            placeholder="Enter description…"
            rows={6}
            disabled={!activeCollection}
          />
        </CollapsibleSection>

        {/* Title Section - Side by side layout for more compact view */}
        <CollapsibleSection
          title="title"
          sectionId="title"
          onGenerate={onGenerate}
          isLoading={loadingSection === "title"}
          disabled={!activeCollection}
        >
          <EditableTextArea
            sectionId="title"
            value={ragData["title"] || ""}
            onChange={handleTextChange}
            placeholder="Enter title…"
            rows={2}
            disabled={!activeCollection}
            className="lg:mt-2"
          />
        </CollapsibleSection>

        {/* Keywords Section - Stacked layout with custom sizing */}
        <CollapsibleSection
          title="keywords"
          sectionId="keywords"
          onGenerate={onGenerate}
          isLoading={loadingSection === "keywords"}
          disabled={!activeCollection}
        >
          <EditableTextArea
            sectionId="keywords"
            value={ragData["keywords"] || ""}
            onChange={handleTextChange}
            placeholder="Enter keywords…"
            rows={4}
            maxHeight="150px"
            disabled={!activeCollection}
            className="mb-2"
          />
        </CollapsibleSection>

        {/* Assays Section - Traditional layout but with custom sizing */}
        <CollapsibleSection
          title="assays"
          sectionId="assays"
          onGenerate={onGenerate}
          isLoading={loadingSection === "assays"}
          disabled={!activeCollection}
        >
          <EditableTextArea
            sectionId="assays"
            value={ragData["assays"] || ""}
            onChange={handleTextChange}
            placeholder="Enter assays…"
            rows={4}
            maxHeight="300px"
            disabled={!activeCollection}
          />
        </CollapsibleSection>

        {/* Experiments Section - Traditional layout but with custom sizing */}
        <CollapsibleSection
          title="experiments"
          sectionId="experiments"
          onGenerate={onGenerate}
          isLoading={loadingSection === "experiments"}
          disabled={!activeCollection}
        >
          <EditableTextArea
            sectionId="experiments"
            value={ragData["experiments"] || ""}
            onChange={handleTextChange}
            placeholder="Enter experiments…"
            rows={4}
            maxHeight="300px"
            disabled={!activeCollection}
          />
        </CollapsibleSection>

        {/* payloads Section - Traditional layout but with custom sizing */}
        <CollapsibleSection
          title="payloads"
          sectionId="payloads"
          onGenerate={onGenerate}
          isLoading={loadingSection === "payloads"}
          disabled={!activeCollection}
        >
          <EditableTextArea
            sectionId="payloads"
            value={ragData["payloads"] || ""}
            onChange={handleTextChange}
            placeholder="Enter payloads…"
            rows={4}
            maxHeight="300px"
            disabled={!activeCollection}
          />
        </CollapsibleSection>

        {/* protocols Section - Traditional layout but with custom sizing */}
        <CollapsibleSection
          title="protocols"
          sectionId="protocols"
          onGenerate={onGenerate}
          isLoading={loadingSection === "protocols"}
          disabled={!activeCollection}
        >
          <EditableTextArea
            sectionId="protocols"
            value={ragData["protocols"] || ""}
            onChange={handleTextChange}
            placeholder="Enter protocols…"
            rows={4}
            maxHeight="300px"
            disabled={!activeCollection}
          />
        </CollapsibleSection>
      </div>
    </div>
  );
}
//   "samples",
//   "publications",
//   "files",
//   "version history",
//   "visualization",
