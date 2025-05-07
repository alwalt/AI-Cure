"use client";
import { useState } from "react";
import CollapsibleSection from "@/components/base/CollapsibleSection";
import EditableTextArea from "../base/EditableTextArea";
import createFetchFunction from "../../../util/createFetchFunction";
import { useSessionFileStore } from "@/store/useSessionFileStore";
import { generateWithTemplate } from "@/lib/ragClient";

export default function StudyComponent() {
  const [description, setDescription] = useState<string>("");
  const [studies, setStudies] = useState<string>("");

  // grab the current CSV names from selectedFiles
  const selectedCsvNames = useSessionFileStore((s) =>
    s.selectedFiles.map((f) => f.name)
  );
  const setRagData = useSessionFileStore((s) => s.setRagData);
  const updateRagSection = useSessionFileStore((s) => s.updateRagSection);
  const ragData = useSessionFileStore((s) => s.ragData);

  // generic onGenerate for any section
  const onGenerate = async (section: string) => {
    const full = await generateWithTemplate(
      selectedCsvNames,
      "biophysics" // hard‐coded template for now
    );
    // stash the entire object
    setRagData(full as Record<string, string>);
    // or, if you only want to update one section at a time:
    // updateRagSection(section, full[section] as string);
  };

  return (
    <div className="w-full overflow-auto">
      <div className="rounded overflow-hidden border border-grey">
        <CollapsibleSection
          title="description"
          fetchFunction={() => onGenerate("description")}
          value={ragData.description || ""}
          onChange={(txt) => updateRagSection("description", txt)}
        >
          <EditableTextArea
            value={description} // Set the current state value as the textarea value
            onChange={(newDescription) => setDescription(newDescription)} // Update the state on user input
            placeholder="Enter description here..."
            rows={20} // Set dynamic rows for the description section
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="studies"
          fetchFunction={() => onGenerate("studies")}
          value={ragData.studies || ""}
          onChange={(txt) => updateRagSection("studies", txt)}
        >
          <EditableTextArea
            value={studies} // Set the current state value as the textarea value
            onChange={(newStudies) => setStudies(newStudies)} // Update the state on user input
            placeholder="Enter studies here..."
            rows={3} // Set dynamic rows for the description section
          />
        </CollapsibleSection>
        {/*
        <CollapsibleSection
          title="payloads"
          fetchFunction={createFetchFunction("payloads")}
        >
          <></>
        </CollapsibleSection>

        <CollapsibleSection
          title="subjects/biospecimens"
          fetchFunction={createFetchFunction("subjects/biospecimens")}
        >
          <></>
        </CollapsibleSection>

        <CollapsibleSection
          title="hardware"
          fetchFunction={createFetchFunction("hardware")}
        >
          <></>
        </CollapsibleSection>

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
