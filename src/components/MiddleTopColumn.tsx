"use client";
import { useState } from "react";
import InvestigationComponent from "./middleTopCol/InvestigationComponent";
import StudyComponent from "./middleTopCol/StudyComponent";
import TextButton from "./base/TextButton";

export default function MiddleTopColumn() {
  const [activeTab, setActiveTab] = useState("investigation");

  const renderContent = () => {
    switch (activeTab) {
      case "investigation":
        return <InvestigationComponent />;
      case "study":
        return <StudyComponent />;
      default:
        return null;
    }
  };

  return (
    <div className="relative bg-primaryBlack p-2 h-full overflow-y-auto">
      <h2 className="sticky top-0 font-bold text-xl p-2 capitalize">
        Scientific data curation
      </h2>
      <div className="border-b border-grey mb-8">
        {/* Tab Buttons */}
        <div className="flex space-x-4 mb-4">
          <TextButton
            label="Investigation"
            buttonDescription="Investigation tab"
            isActive={activeTab === "investigation"}
            onClick={() => setActiveTab("investigation")}
          />

          <TextButton
            label="Study"
            buttonDescription="Study tab"
            isActive={activeTab === "study"}
            onClick={() => setActiveTab("study")}
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="rounded">{renderContent()}</div>
    </div>
  );
}
