import { useState } from "react";
import AiGenerateButton from "@/components/base/AiGenerateButton";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid"; // Ensure Heroicons is installed for these icons
import CollapsibleSection from "@/components/base/CollapsibleSection";

export default function InvestigationComponent() {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isTitleOpen, setIsTitleOpen] = useState(false);

  // Toggles the description visibility
  const toggleDescription = () => setIsDescriptionOpen(!isDescriptionOpen);

  // Toggles the title visibility
  const toggleTitle = () => setIsTitleOpen(!isTitleOpen);

  return (
    <div className="w-full overflow-auto">
      <div className="min-w-[400px] max-w-[850px] rounded overflow-hidden border border-grey">
        <CollapsibleSection title="Description">
          <p>Super conduting magnents.</p>
        </CollapsibleSection>

        {/* Title Banner */}
        <button
          onClick={toggleTitle}
          className="flex justify-between items-center w-full bg-green-500 text-white p-3 rounded-md mt-2"
        >
          <div className="flex items-center gap-2">
            <span>Title</span>
          </div>
          {isTitleOpen ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </button>

        {/* Title Content */}
        {isTitleOpen && (
          <div className="p-4">
            <AiGenerateButton />
            <p>Test entry</p>
          </div>
        )}
      </div>
    </div>
  );
}
