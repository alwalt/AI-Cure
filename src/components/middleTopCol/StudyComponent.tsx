"use client";
import { useState, useMemo } from "react";
import CollapsibleSection from "@/components/base/CollapsibleSection";
import { useSessionFileStore } from "@/store/useSessionFileStore";
import { generateWithTemplate } from "@/lib/ragClient";

export default function StudyComponent() {
  const [loadingSection, setLoadingSection] = useState<string | null>(null);

  // 1) Select the raw UploadedFile[] from Zustand (stable until it really changes)
  const selectedFiles = useSessionFileStore((s) => s.selectedFiles);
  const setFullRagData = useSessionFileStore((state) => state.setFullRagData);
  const fullRagData = useSessionFileStore((s) => s.fullRagData); // whole obj from rag call
  const updateRagSection = useSessionFileStore((s) => s.updateRagSection);
  const ragData = useSessionFileStore((s) => s.ragData); // single description, leave to be editable

  const CollapsibleSectionTitles = [
    "description",
    "studies",
    "subjects/biospecimens",
    "hardware",
  ];
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
      return;
    }

    setLoadingSection(section);
    try {
      console.log("Preparing to FETCH, selectedFileNames", selectedFileNames);
      const fullSectionObj = await generateWithTemplate(
        selectedFileNames,
        "biophysics" // hard‐coded template for now
      );

      // normalize every value to a string
      const normalized = Object.fromEntries(
        Object.entries(fullSectionObj).map(([k, v]) => [
          k,
          typeof v === "string" ? v : JSON.stringify(v),
        ])
      ) as Record<string, string>;
      // store the normalized fullRagData rag object separately
      setFullRagData(normalized);

      console.log("After fetch, fullSectionObj obj", fullSectionObj);
      // update the section where the button was clicked:
      // We can make it so that every section is updated instead of just one.
      updateRagSection(section, normalized[section]);
    } finally {
      setLoadingSection(null);
    }
  };

  return (
    <div className="w-full overflow-auto">
      <div className="rounded overflow-hidden border border-grey">
        {CollapsibleSectionTitles.map((section) => (
          <CollapsibleSection
            key={section}
            title={section}
            onGenerate={() => onGenerate(section)}
            value={ragData[section]}
            onChange={(txt) => updateRagSection(section, txt)}
            isLoading={loadingSection === section}
          />
        ))}
      </div>
    </div>
  );
}
