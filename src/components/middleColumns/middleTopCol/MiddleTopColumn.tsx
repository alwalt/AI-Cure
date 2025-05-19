"use client";
import { useState } from "react";
import PDFExtractor from "./PDFExtractorComponent";
import StudyComponent from "./StudyComponent";
import TextButton from "../../base/TextButton";

export default function MiddleTopColumn() {
  const [activeTab, setActiveTab] = useState("study");

  const renderContent = () => {
    switch (activeTab) {
      case "pdfextractor":
        return <PDFExtractor />;
      case "study":
        return <StudyComponent />;
      default:
        return null;
    }
  };

  return (
    <div className="relative bg-primaryBlack mt-2 h-full max-h-full overflow-y-auto custom-scrollbar">
      <div className="sticky top-0 z-10 bg-primaryBlack">
        <h2 className="font-bold text-xl p-2 capitalize">
          Scientific data curation
        </h2>
        <div className="border-b border-grey mb-2 pl-2">
          {/* Tab Buttons */}
          <div className="flex space-x-4 mb-4">
            <TextButton
              label="Study"
              buttonDescription="Study tab"
              isActive={activeTab === "study"}
              onClick={() => setActiveTab("study")}
            />
            <TextButton
              label="PDF Extractor"
              buttonDescription="PDF Extractor tab"
              isActive={activeTab === "pdfextractor"}
              onClick={() => setActiveTab("pdfextractor")}
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="rounded w-full overflow-x-auto">{renderContent()}</div>
    </div>
  );
}
