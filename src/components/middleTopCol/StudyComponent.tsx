"use client";
import { useState, useMemo } from "react";
import CollapsibleSection from "@/components/base/CollapsibleSection";
import EditableTextArea from "../base/EditableTextArea";
import { useSessionFileStore } from "@/store/useSessionFileStore";
import { generateWithTemplate } from "@/lib/ragClient";

export default function StudyComponent() {
  // const [description, setDescription] = useState<string>(""); // seems like not being used but are
  // const [studies, setStudies] = useState<string>(""); // will need to add in other CollapsibleSection titles
  // const [species, setSpecies ] = useState<string>("");

  // 1) Select the raw UploadedFile[] from Zustand (stable until it really changes)
  const selectedFiles = useSessionFileStore((s) => s.selectedFiles);
  const setFullRagData = useSessionFileStore((state) => state.setFullRagData);
  const fullRagData = useSessionFileStore((s) => s.fullRagData); // whole obj from rag call
  // const setRagData = useSessionFileStore((s) => s.setRagData);
  const updateRagSection = useSessionFileStore((s) => s.updateRagSection);
  const ragData = useSessionFileStore((s) => s.ragData); // single description, leave to be editable
  // grab the current file names from selectedFiles
  const selectedFileNames = useMemo(
    () => selectedFiles.map((f) => f.name),
    [selectedFiles]
  );

  // generic onGenerate for any section
  const onGenerate = async (section: string) => {
    if (fullRagData[section]) {
      console.log("updating section, ", section, ", no rag call");
      updateRagSection(section, fullRagData[section] as string);
    } else {
      console.log("Preparing to FETCH, selectedFileNames", selectedFileNames);

      const fullSectionObj = await generateWithTemplate(
        selectedFileNames,
        "biophysics" // hard‐coded template for now
      );

      // normalize every value to a string
      const normalized: Record<string, string> = Object.fromEntries(
        Object.entries(fullSectionObj).map(([k, v]) => [
          k,
          typeof v === "string" ? v : JSON.stringify(v),
        ])
      );
      // store the fullRagData rag object separately
      setFullRagData(normalized);

      console.log("After fetch, fullSectionObj obj", fullSectionObj);
      // update one section at a time:
      updateRagSection(section, normalized[section]);
    }
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
      </div>
    </div>
  );
}
