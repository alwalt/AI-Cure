import AiGenerateButton from "@/components/base/AiGenerateButton";
import { CollapsibleSectionProps } from "@/types/files";
import { DocumentIcon } from "@heroicons/react/24/outline";
import {
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";
import { sectionIcons } from "../../../util/sectionIcons";
import EditableTextArea from "./EditableTextArea";

export default function CollapsibleSection({
  title,
  onGenerate,
  value,
  onChange,
  isLoading = false,
  disabled = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = sectionIcons[title] || DocumentIcon; // Dynamically get the correct icon | backup icon if not in Dict

  // Toggles the section visibility
  const toggleSection = () => setIsOpen(!isOpen);

  // Handle keydown for keyboard navigation (Space/Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(); // Prevent default behavior for Space/Enter
      toggleSection();
    }
  };

  return (
    <div className="w-full bg-grey p-2">
      <button
        type="button"
        onClick={toggleSection}
        onKeyDown={handleKeyDown} // Allow Space/Enter for toggle
        aria-expanded={isOpen} // Indicate whether the content is expanded or collapsed
        aria-controls={`section-content-${title}`} // Link button with content
        className="flex justify-between items-center w-full bg-primaryBlue text-primaryWhite p-3 rounded-md hover:bg-selectedBlue hover:font-bold transition-colors duration-300"
      >
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon
              className={`h-6 w-6 transition-transform duration-300 ease-in-out ${
                isOpen ? "stroke-2" : ""
              }`}
            />
          )}
          <span className="capitalize">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUpIcon className="w-5 h-5" />
        ) : (
          <ChevronDownIcon className="w-5 h-5" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div id={`section-content-${title}`} className="p-2">
          <div className="flex items-center gap-2">
            <AiGenerateButton 
              onClick={onGenerate} 
              disabled={isLoading || disabled} 
            />
            {isLoading && (
              <ArrowPathIcon
                className="loader h-6 w-6 animate-spin"
                aria-label="Loading…"
              />
            )}
            {disabled && !isLoading && (
              <span className="text-xs text-yellow-400">
                Load a collection to generate content
              </span>
            )}
          </div>
          <EditableTextArea
            value={value}
            onChange={onChange}
            placeholder={`Enter ${title}…`}
          />
        </div>
      )}
    </div>
  );
}
