"use client";
import { useState } from "react";
import InvestigationComponent from "./middleTopCol/InvestigationComponent";
import StudyComponent from "./middleTopCol/StudyComponent";

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
      {/* Tab Buttons */}
      <div className="flex space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "investigation"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("investigation")}
        >
          Investigation
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "study" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("study")}
        >
          Study
        </button>
      </div>

      {/* Table Content */}
      <div className="rounded">{renderContent()}</div>
    </div>
  );
}
