"use client";
import { useState, useMemo } from "react";
import CollapsibleSection from "@/components/base/CollapsibleSection";
import EditableTextArea from "../base/EditableTextArea";
import { useSessionFileStore } from "@/store/useSessionFileStore";
import { generateWithTemplate } from "@/lib/ragClient";

export default function StudyComponent() {
  const [description, setDescription] = useState<string>(""); // seems like not being used but are
  const [studies, setStudies] = useState<string>(""); // will need to add in other CollapsibleSection titles

  // 1) Select the raw UploadedFile[] from Zustand (stable until it really changes)
  const selectedFiles = useSessionFileStore((s) => s.selectedFiles);
  const setFullRagData = useSessionFileStore((state) => state.setFullRagData);

  // grab the current CSV names from selectedFiles
  const selectedCsvNames = useMemo(
    () => selectedFiles.map((f) => f.name),
    [selectedFiles]
  );

  // const setRagData = useSessionFileStore((s) => s.setRagData);
  const updateRagSection = useSessionFileStore((s) => s.updateRagSection);
  const ragData = useSessionFileStore((s) => s.ragData);

  // generic onGenerate for any section
  const onGenerate = async (section: string) => {
    console.log("BEFORE FETCH, selectedCsvNames", selectedCsvNames);
    const full = await generateWithTemplate(
      selectedCsvNames,
      "biophysics" // hard‐coded template for now
    );

    // store the full rag object separately
    setFullRagData(full as Record<string, string>);

    console.log("After fetch, full obj", full);
    // update one section at a time:
    updateRagSection(section, full[section] as string);
  };

  return (
    <div className="w-full overflow-auto">
      <div className="rounded overflow-hidden border border-grey">
        <CollapsibleSection
          title="description"
          onGenerate={() => onGenerate("description")}
          value={ragData.description}
          onChange={(txt) => updateRagSection("description", txt)}
        ></CollapsibleSection>

        <CollapsibleSection
          title="studies"
          onGenerate={() => onGenerate("studies")}
          value={ragData.studies}
          onChange={(txt) => updateRagSection("studies", txt)}
        ></CollapsibleSection>

        <CollapsibleSection
          title="subjects/biospecimens"
          onGenerate={() => onGenerate("subjects/biospecimens")}
          value={ragData["subjects/biospecimens"]}
          onChange={(txt) => updateRagSection("subjects/biospecimens", txt)}
        ></CollapsibleSection>

        <CollapsibleSection
          title="hardware"
          onGenerate={() => onGenerate("hardware")}
          value={ragData.hardware}
          onChange={(txt) => updateRagSection("hardware", txt)}
        ></CollapsibleSection>
        {/* 

        <CollapsibleSection
          title="publications"
          fetchFunction={createFetchFunction("publications")}
        >
          <></>
        </CollapsibleSection>

        <CollapsibleSection
          title="files"
          fetchFunction={createFetchFunction("files")}
        >
          <></>
        </CollapsibleSection>

        <CollapsibleSection
          title="version history"
          fetchFunction={createFetchFunction("version history")}
        >
          <></>
        </CollapsibleSection>
        */}
      </div>
    </div>
  );
}
