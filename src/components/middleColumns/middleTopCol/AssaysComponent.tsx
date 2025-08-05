import useAssaysStore from "@/store/useAssaysStore";
import { AssaysTable } from "./AssayTableComponent";

export default function AssaysComponent() {
  // Get data from assays store
  const { assayTitles, assaysData } = useAssaysStore();

  return (
    <div className="w-full overflow-auto space-y-4">
      {/* Optional: Show info about available assay titles */}
      {assayTitles && assayTitles.length > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-1">
            Available Assay Titles from Study:
          </h3>
          <p className="text-sm text-blue-600">{assayTitles.join(", ")}</p>
        </div>
      )}

      {/* Always show the table */}
      <AssaysTable assaysData={assaysData} isLoading={false} />
    </div>
  );
}
