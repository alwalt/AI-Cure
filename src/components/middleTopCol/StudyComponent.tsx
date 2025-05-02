"use client";
import { useState } from "react";
import CollapsibleSection from "@/components/base/CollapsibleSection";
import EditableTextArea from "../base/EditableTextArea";
import createFetchFunction from "../../../util/createFetchFunction";

export default function StudyComponent() {
  const [description, setDescription] = useState<string>("");
  const [studies, setStudies] = useState<string>("");

  return (
    <div className="w-full overflow-auto">
      <div className="rounded overflow-hidden border border-grey">
        <CollapsibleSection
          title="description"
          fetchFunction={createFetchFunction("description")}
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
          fetchFunction={createFetchFunction("studies")}
        >
          <EditableTextArea
            value={studies} // Set the current state value as the textarea value
            onChange={(newStudies) => setStudies(newStudies)} // Update the state on user input
            placeholder="Enter studies here..."
            rows={3} // Set dynamic rows for the description section
          />
        </CollapsibleSection>

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
      </div>
    </div>
  );
}
