import { useState, ReactNode } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { CollapsibleSectionProps } from "@/types/files";
import AiGenerateButton from "@/components/base/AiGenerateButton";
import useAiGenerateFetch from "./useAiGenerateFetch";
import { sectionIcons } from "../../../util/sectionIcons";

export default function CollapsibleSection({
  title,
  fetchFunction,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, fetchData] = useAiGenerateFetch(fetchFunction);
  const Icon = sectionIcons[title]; // Dynamically get the correct icon

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
          {Icon && <Icon className="h-6 w-6" />}{" "}
          {/* Conditionally render if an icon exists */}
          <span>{title}</span>
        </div>
        {isOpen ? (
          <ChevronUpIcon className="w-5 h-5" />
        ) : (
          <ChevronDownIcon className="w-5 h-5" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div id={`section-content-${title}`} className="p-4">
          <AiGenerateButton onClick={fetchData} />
          {children}
        </div>
      )}
    </div>
  );
}
