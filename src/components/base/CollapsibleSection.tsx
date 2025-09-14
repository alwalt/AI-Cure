// src/components/base/CollapsibleSection.tsx
import AiGenerateButton from "@/components/base/AiGenerateButton";
import { CollapsibleSectionProps } from "@/types/files";
import { sectionIcons } from "@/util/sectionIcons";
import { ChevronDown, ChevronUp, File, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function CollapsibleSection({
  title,
  sectionId,
  onGenerate,
  isLoading = false,
  disabled = false,
  initiallyOpen = false,
  children, // Allow custom content inside the section
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const Icon = sectionIcons[title] || File; // Dynamically get the correct icon | backup icon if not in Dict

  // Toggles the section visibility
  const toggleSection = () => setIsOpen(!isOpen);

  // Handle keydown for keyboard navigation (Space/Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(); // Prevent default behavior for Space/Enter
      toggleSection();
    }
  };

  // Enhanced onGenerate that passes the sectionId
  const handleGenerate = () => {
    onGenerate(sectionId);
  };

  return (
    <div className="w-full bg-grey p-2">
      <button
        type="button"
        onClick={toggleSection}
        onKeyDown={handleKeyDown} // Allow Space/Enter for toggle
        aria-expanded={isOpen} // Indicate whether the content is expanded or collapsed
        aria-controls={`section-content-${sectionId}`} // Link button with content using sectionId
        className="group flex justify-between items-center w-full bg-primaryBlue text-primaryWhite p-3 rounded-md hover:bg-selectedBlue hover:font-bold transition-colors duration-300"
      >
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon
              strokeWidth={isOpen ? 2 : 1}
              className="h-6 w-6 transition-transform duration-300 ease-in-out [stroke-width:1] group-hover:[stroke-width:2]"
            />
          )}
          <span className="capitalize">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div id={`section-content-${sectionId}`} className="p-2">
          <div className="flex items-center gap-2">
            <AiGenerateButton
              onClick={handleGenerate}
              disabled={isLoading || disabled}
            />
            {isLoading && (
              <RefreshCw
                className="loader h-6 w-6 animate-spin text-primaryWhite"
                aria-label="Loading…"
              />
            )}
            {disabled && !isLoading && (
              <span className="text-xs text-yellow-400">
                Load a collection to generate content
              </span>
            )}
          </div>
          {/* Custom content can be placed here via children prop */}
          {children}
        </div>
      )}
    </div>
  );
}
