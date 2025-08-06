import { useState } from "react";
import { AssaysTable } from "./AssayTableComponent";

export default function AssaysComponent() {
  const [activeTab, setActiveTab] = useState<"western-blot" | "calcium-uptake">(
    "western-blot"
  );

  const tabs = [
    { id: "western-blot", name: "Western Blot" },
    { id: "calcium-uptake", name: "Calcium Uptake" },
  ] as const;

  return (
    <div className="w-full overflow-auto space-y-4">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex justify-center space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-selectedBlue text-selectedBlue font-bold text-lg"
                  : "border-transparent text-brightGrey font-normal text-sm hover:text-primaryWhite hover:border-brightGrey hover:font-semibold"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "western-blot" && (
          <div>
            <AssaysTable />
          </div>
        )}

        {activeTab === "calcium-uptake" && (
          <div>
            <AssaysTable />
          </div>
        )}
      </div>
    </div>
  );
}
