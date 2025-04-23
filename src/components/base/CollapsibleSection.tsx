import { useState, ReactNode } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { CollapsibleSectionProps } from "@/types/files";
import AiGenerateButton from "@/components/base/AiGenerateButton";

export default function CollapsibleSection({
  title,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Toggles the section visibility
  const toggleSection = () => setIsOpen(!isOpen);

  return (
    <div className="w-full bg-grey p-2">
      <button
        onClick={toggleSection}
        className="flex justify-between items-center w-full bg-primaryBlue text-primaryWhite p-3 rounded-md hover:bg-selectedBlue hover:font-bold transition-colors duration-300"
      >
        <div className="flex items-center gap-2">
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
        <div className="p-4">
          <AiGenerateButton />
          {children}
        </div>
      )}
    </div>
  );
}
