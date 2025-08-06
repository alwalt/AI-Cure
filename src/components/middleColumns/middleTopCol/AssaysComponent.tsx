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

  const handleKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    const currentIndex = tabs.findIndex((tab) => tab.id === tabId);

    if (e.key === "ArrowRight") {
      const nextIndex = (currentIndex + 1) % tabs.length;
      setActiveTab(tabs[nextIndex].id);
    } else if (e.key === "ArrowLeft") {
      const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
      setActiveTab(tabs[prevIndex].id);
    }
  };

  return (
    <div className="w-full overflow-auto space-y-4">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav
          className="-mb-px flex justify-center space-x-8"
          role="tablist"
          aria-label="Assay types"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              id={`${tab.id}-tab`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              className={`py-2 px-1 border-b-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-selectedBlue focus-visible:ring-offset-2 ${
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
          <div
            role="tabpanel"
            id="western-blot-panel"
            aria-labelledby="western-blot-tab"
            tabIndex={0}
          >
            <AssaysTable />
          </div>
        )}

        {activeTab === "calcium-uptake" && (
          <div
            role="tabpanel"
            id="calcium-uptake-panel"
            aria-labelledby="calcium-uptake-tab"
            tabIndex={0}
          >
            <AssaysTable />
          </div>
        )}
      </div>
    </div>
  );
}
