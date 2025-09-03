"use client";
import { useState } from "react";
import { Info, X } from "lucide-react";

interface InfoModalProps {
  title: string;
  description: string;
  className?: string;
}

export default function InfoModal({
  title,
  description,
  className = "",
}: InfoModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      {/* Info Icon Button */}
      <button
        onClick={openModal}
        className={`inline-flex items-center justify-center w-4 h-4 text-text-default hover:text-button-hover-red transition-all duration-300 ${className}`}
        aria-label={`Information about ${title}`}
      >
        <Info className="w-3 h-3" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-default"
          onClick={closeModal}
        >
          {/* Modal Content */}
          <div
            className="bg-surface-modal-margin border border-border-accent rounded-lg p-6 max-w-md w-full mx-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-default font-semibold text-lg">
                {title}
              </h3>
              <button
                onClick={closeModal}
                className="text-text-default hover:text-button-hover-navigation transition-all duration-300 p-1"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Description */}
            <div className="text-text-default text-sm leading-relaxed pb-10">
              {description}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
