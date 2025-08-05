import { useSessionFileStore } from "@/store/useSessionFileStore";
import useAssaysStore from "@/store/useAssaysStore"; // adjust path
import { AssaysTable } from "./AssayTableComponent";
import { generateSingleRag } from "@/lib/ragClient"; // adjust path

export default function AssaysComponent() {
  // Get data from session store (for files and session info)
  const selectedFiles = useSessionFileStore((state) => state.selectedFiles);
  const sessionId = useSessionFileStore((state) => state.sessionId);

  // Get data from assays store
  const {
    assayTitles,
    assaysData,
    isLoadingTitles,
    isLoadingTableData,
    error,
    setAssayTitles,
    setAssaysData,
    setIsLoadingTitles,
    setError,
  } = useAssaysStore();

  const handleGenerateAssays = async () => {
    if (!sessionId || selectedFiles.length === 0) {
      setError("No session ID or selected files");
      return;
    }

    setIsLoadingTitles(true);
    setError(null);

    try {
      const fileNames = selectedFiles.map((file) => file.name);
      const result = await generateSingleRag("assays", fileNames, sessionId);

      // result is always a string from the backend (assays: str)
      if (typeof result === "string") {
        // Parse the string - could be comma-separated or formatted like "[Western Blotting, Ponceau Staining]"
        let titlesString = result.trim();

        // Remove brackets if they exist
        if (titlesString.startsWith("[") && titlesString.endsWith("]")) {
          titlesString = titlesString.slice(1, -1);
        }

        // Split by comma and clean up
        const titles = titlesString.split(",").map((title) => title.trim());
        setAssayTitles(titles);

        // Convert titles to table format
        const tableData = titles.map((title) => ({
          sample_name: title,
          protein: "TBD",
          imaging_method: "TBD",
          blocking_duration: "TBD",
          block_concentration: "TBD",
        }));
        setAssaysData(tableData);
      } else {
        throw new Error("Unexpected result format from assays API");
      }
    } catch (error) {
      console.error("Failed to generate assays:", error);
      setError("Failed to generate assays. Please try again.");
    } finally {
      setIsLoadingTitles(false);
    }
  };

  const isLoading = isLoadingTitles || isLoadingTableData;

  return (
    <div className="w-full overflow-auto space-y-4">
      <div className="flex flex-col space-y-2">
        <button
          onClick={handleGenerateAssays}
          disabled={isLoading || !sessionId || selectedFiles.length === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          {isLoading ? "Generating..." : "Generate Assays in study tab first"}
        </button>

        {error && <div className="text-red-600 text-sm">{error}</div>}
      </div>

      <AssaysTable assaysData={assaysData} isLoading={isLoading} />
    </div>
  );
}
