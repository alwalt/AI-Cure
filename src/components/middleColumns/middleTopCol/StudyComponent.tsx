"use client";
import { useState } from "react";
import CollapsibleSection from "@/components/base/CollapsibleSection";
import {
  useSessionFileStore,
  SessionFileStoreState,
} from "@/store/useSessionFileStore";
import { generateWithTemplate, generateSingleRag } from "@/lib/ragClient";
import { RagResponse, UploadedFile } from "@/types/files";

export default function StudyComponent() {
  const [loadingSection, setLoadingSection] = useState<string | null>(null);

  const collections = useSessionFileStore(
    (state: SessionFileStoreState) => state.collections
  );
  const getAllCollectionFiles = useSessionFileStore(
    (state: SessionFileStoreState) => state.getAllCollectionFiles
  );
  const sessionId = useSessionFileStore(
    (state: SessionFileStoreState) => state.sessionId
  );
  const setFullRagData = useSessionFileStore(
    (state: SessionFileStoreState) => state.setFullRagData
  );
  const ragData = useSessionFileStore(
    (state: SessionFileStoreState) => state.ragData
  );
  const updateRagSection = useSessionFileStore(
    (state: SessionFileStoreState) => state.updateRagSection
  );

  const CollapsibleSectionTitles = ["title", "description", "keywords"];

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

    const allFiles = getAllCollectionFiles();
    if (!allFiles || allFiles.length === 0) {
      console.error(
        "StudyComponent: No files in any collection for RAG data generation."
      );
      alert("No files in collections. Please add and ingest files first.");
      return;
    }

    const fileNamesForRAG = allFiles.map((file: UploadedFile) => file.name);
    console.log(
      "StudyComponent: Calling RAG generation for section:",
      sectionToLoad,
      "with fileNames:",
      fileNamesForRAG
    );
    console.log(
      "StudyComponent: Using files from",
      collections.length,
      "collection(s)"
    );

    setLoadingSection(sectionToLoad);
    try {
      // const ragResponse: RagResponse = await generateWithTemplate(
      //   fileNamesForRAG,
      //   "biophysics"
      // );
      // console.log("StudyComponent: RAG data received:", ragResponse);
      // setFullRagData(ragResponse);

      // 🔥 new per-section call
      const result = await generateSingleRag(
        sectionToLoad as "description" | "title" | "keywords",
        fileNamesForRAG,
        sessionId
      );

      // normalize keywords array into a string for editableTextArea
      const textResult =
        sectionToLoad === "keywords" && Array.isArray(result)
          ? result.join(", ")
          : (result as string);

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
      <div className="flex flex-col overflow-hidden">
        {CollapsibleSectionTitles.map((sectionTitle) => (
          <CollapsibleSection
            key={sectionTitle}
            title={sectionTitle}
            onGenerate={() => onGenerate(sectionTitle)}
            value={ragData[sectionTitle] || ""}
            onChange={(txt) => updateRagSection(sectionTitle, txt)}
            isLoading={loadingSection === sectionTitle}
          />
        ))}
      </div>
    </div>
  );
}
