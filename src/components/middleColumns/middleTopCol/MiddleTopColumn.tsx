"use client";
import { useState } from "react";
import PDFExtractor from "./PDFExtractorComponent";
import StudyComponent from "./StudyComponent";
import TextButton from "../../base/TextButton";
import PowerPointExtractor from "./PowerPointExtractor";

export default function MiddleTopColumn() {
  const [activeTab, setActiveTab] = useState("study");

  const renderContent = () => {
    switch (activeTab) {
      case "pdfextractor":
        return <PDFExtractor />;
      case "study":
        return <StudyComponent />;
      case "PowerPointExtractor":
        return <PowerPointExtractor />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-primaryBlack overflow-y-auto custom-scrollbar border-b border-gray-700">
      <div className="sticky top-0 z-10 bg-primaryBlack overflow-hidden">
        <h2 className="font-bold text-primaryWhite text-xl p-2 capitalize">
          Scientific data curation
        </h2>
        <div className="border-b border-grey mb-0 pl-2 overflow-hidden">
          {/* Tab Buttons */}
          <div className="flex space-x-4 mb-4 overflow-auto">
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
            <TextButton
              label="Power Point Extractor"
              buttonDescription="Power Point Extractor tab"
              isActive={activeTab === "PowerPointExtractor"}
              onClick={() => setActiveTab("PowerPointExtractor")}
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-auto">
        {renderContent()}
      </div>
    </div>
  );
}
