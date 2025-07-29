"use client";
import { useState } from "react";
import StudyComponent from "./StudyComponent";
import TextButton from "../../base/TextButton";
import { TabButtons } from "@/types/files";
import Assays from "./Assays";

export default function MiddleTopColumn() {
  const [activeTab, setActiveTab] = useState("study");
  const tabs: TabButtons[] = [
    { id: "study", label: "Study", description: "Study tab" },
    {
      id: "assays",
      label: "Assays",
      description: "Assays",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "study":
        return <StudyComponent />;
      case "assays":
        return <Assays />;
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
        <div className="border-b border-grey mb-0 overflow-hidden">
          {/* Tab Buttons */}
          <div className="flex gap-x-4 mb-4 overflow-auto items-center">
            {tabs.map(({ id, label, description }) => (
              <div key={id} className="flex-1 h-full">
                <TextButton
                  label={label}
                  buttonDescription={description}
                  isActive={activeTab === id}
                  onClick={() => setActiveTab(id)}
                  buttonClassName="w-full text-center h-full flex items-center justify-center"
                />
              </div>
            ))}
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
