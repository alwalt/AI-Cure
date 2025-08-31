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
        className={`inline-flex items-center justify-center w-4 h-4 text-text-default hover:text-text-default transition-all duration-300 ${className}`}
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
            className="bg-surface-contrast border border-border-accent rounded-lg p-6 max-w-md w-full mx-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-default font-semibold text-lg">
                {title}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-text-default transition-colors p-1"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <div className="text-text-default text-sm leading-relaxed">
              {description}
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-surface-navigation text-button-navigation px-4 py-2 rounded-md text-sm font-medium hover:bg-button-hover-navigation transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
