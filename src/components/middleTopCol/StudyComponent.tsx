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
      <div className="min-w-[400px] max-w-[850px] rounded overflow-hidden border border-grey">
        <CollapsibleSection
          title="Description"
          fetchFunction={createFetchFunction("Description")}
        >
          <EditableTextArea
            value={description} // Set the current state value as the textarea value
            onChange={(newDescription) => setDescription(newDescription)} // Update the state on user input
            placeholder="Enter description here..."
            rows={20} // Set dynamic rows for the description section
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Studies"
          fetchFunction={createFetchFunction("Studies")}
        >
          <EditableTextArea
            value={studies} // Set the current state value as the textarea value
            onChange={(newStudies) => setStudies(newStudies)} // Update the state on user input
            placeholder="Enter Studies here..."
            rows={3} // Set dynamic rows for the description section
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Payloads"
          fetchFunction={createFetchFunction("Payloads")}
        >
          <></>
        </CollapsibleSection>

        <CollapsibleSection
          title="Subjects/Biospecimens"
          fetchFunction={createFetchFunction("Subjects/Biospecimens")}
        >
          <></>
        </CollapsibleSection>

        <CollapsibleSection
          title="Hardware"
          fetchFunction={createFetchFunction("Hardware")}
        >
          <></>
        </CollapsibleSection>

        <CollapsibleSection
          title="Publications"
          fetchFunction={createFetchFunction("Publications")}
        >
          <></>
        </CollapsibleSection>

        <CollapsibleSection
          title="Files"
          fetchFunction={createFetchFunction("Files")}
        >
          <></>
        </CollapsibleSection>

        <CollapsibleSection
          title="Version history"
          fetchFunction={createFetchFunction("Version history")}
        >
          <></>
        </CollapsibleSection>
      </div>
    </div>
  );
}
