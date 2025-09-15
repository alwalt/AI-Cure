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
import DescriptionCollapsibleSection from "../collapsibleSections/DescriptionCollapsibleSection";
import KeywordsCollapsibleSection from "../collapsibleSections/KeywordsCollapsibleSection";
import TitleCollapsibleSection from "../collapsibleSections/TitleCollapsibleSection";
import ProtocolsCollapsibleSection from "../collapsibleSections/ProtocolsCollapsibleSection";
import PayloadsCollapsibleSection from "../collapsibleSections/PayloadsCollapsibleSection";
import ExperimentsCollapsibleSection from "../collapsibleSections/ExperimentsCollapsibleSection";
import AssaysCollapsibleSection from "../collapsibleSections/AssaysCollapsibleSection";

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
      {/* !!! It's hard coded instead of map because each section will have its own styling in the end. */}
      <div className="flex flex-col overflow-hidden space-y-4">
        {/* Description Section - Traditional layout with textarea inside */}
        <DescriptionCollapsibleSection
          onGenerate={onGenerate} // Passes RAG function
          isLoading={loadingSection === "description"} // Checks if this section is loading
          disabled={!activeCollection} // Disables if no collection
          value={ragData["description"] || ""} // Current description text
          onChange={handleTextChange} // Text change handler
        />

        {/* Title Section - Side by side layout for more compact view */}
        <TitleCollapsibleSection
          onGenerate={onGenerate} // Passes RAG function
          isLoading={loadingSection === "title"} // Checks if this section is loading
          disabled={!activeCollection} // Disables if no collection
          value={ragData["title"] || ""} // Current title text
          onChange={handleTextChange} // Text change handler
        />

        {/* Keywords Section - Stacked layout with custom sizing */}
        <KeywordsCollapsibleSection
          onGenerate={onGenerate}
          isLoading={loadingSection === "keywords"}
          disabled={!activeCollection}
          value={ragData["keywords"] || ""}
          onChange={handleTextChange}
        />

        {/* Assays Section - Traditional layout but with custom sizing */}
        <AssaysCollapsibleSection
          onGenerate={onGenerate}
          isLoading={loadingSection === "assays"}
          disabled={!activeCollection}
          value={ragData["assays"] || ""}
          onChange={handleTextChange}
        />

        {/* Experiments Section - Traditional layout but with custom sizing */}
        <ExperimentsCollapsibleSection
          onGenerate={onGenerate}
          isLoading={loadingSection === "experiments"}
          disabled={!activeCollection}
          value={ragData["experiments"] || ""}
          onChange={handleTextChange}
        />

        {/* payloads Section - Traditional layout but with custom sizing */}
        <PayloadsCollapsibleSection
          onGenerate={onGenerate}
          isLoading={loadingSection === "payloads"}
          disabled={!activeCollection}
          value={ragData["payloads"] || ""}
          onChange={handleTextChange}
        />

        {/* protocols Section - Traditional layout but with custom sizing */}
        <ProtocolsCollapsibleSection
          onGenerate={onGenerate}
          isLoading={loadingSection === "protocols"}
          disabled={!activeCollection}
          value={ragData["protocols"] || ""}
          onChange={handleTextChange}
        />

        {/* samples Section - Traditional layout but with custom sizing */}
        <CollapsibleSection
          title="samples"
          sectionId="samples"
          onGenerate={onGenerate}
          isLoading={loadingSection === "samples"}
          disabled={!activeCollection}
        >
          <EditableTextArea
            sectionId="samples"
            value={ragData["samples"] || ""}
            onChange={handleTextChange}
            placeholder="Enter samples…"
            rows={4}
            maxHeight="300px"
            disabled={!activeCollection}
          />
        </CollapsibleSection>

        {/* publications Section - Traditional layout but with custom sizing */}
        <CollapsibleSection
          title="publications"
          sectionId="publications"
          onGenerate={onGenerate}
          isLoading={loadingSection === "publications"}
          disabled={!activeCollection}
        >
          <EditableTextArea
            sectionId="publications"
            value={ragData["publications"] || ""}
            onChange={handleTextChange}
            placeholder="Enter publications…"
            rows={4}
            maxHeight="300px"
            disabled={!activeCollection}
          />
        </CollapsibleSection>

        {/* files Section - Traditional layout but with custom sizing */}
        <CollapsibleSection
          title="files"
          sectionId="files"
          onGenerate={onGenerate}
          isLoading={loadingSection === "files"}
          disabled={!activeCollection}
        >
          <EditableTextArea
            sectionId="files"
            value={ragData["files"] || ""}
            onChange={handleTextChange}
            placeholder="Enter files…"
            rows={4}
            maxHeight="300px"
            disabled={!activeCollection}
          />
        </CollapsibleSection>

        {/* version history Section - Traditional layout but with custom sizing */}
        <CollapsibleSection
          title="version history"
          sectionId="version history"
          onGenerate={onGenerate}
          isLoading={loadingSection === "version history"}
          disabled={!activeCollection}
        >
          <EditableTextArea
            sectionId="version history"
            value={ragData["version history"] || ""}
            onChange={handleTextChange}
            placeholder="Enter version history…"
            rows={4}
            maxHeight="300px"
            disabled={!activeCollection}
          />
        </CollapsibleSection>

        {/* visualization Section - Traditional layout but with custom sizing */}
        <CollapsibleSection
          title="visualization"
          sectionId="visualization"
          onGenerate={onGenerate}
          isLoading={loadingSection === "visualization"}
          disabled={!activeCollection}
        >
          <EditableTextArea
            sectionId="visualization"
            value={ragData["visualization"] || ""}
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
