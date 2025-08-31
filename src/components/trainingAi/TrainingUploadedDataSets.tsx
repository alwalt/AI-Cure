"use client";
import { Database } from "lucide-react";
import { useDataSets, DataSet } from "@/store/useDataSets";

export default function TrainingUploadedDataSets() {
  const {
    uploadedDataSets,
    selectedDataSets,
    currentPreviewDataSet,
    setSelectedDataSets,
    setCurrentPreviewDataSet,
  } = useDataSets();

  const previewDataSet = async (dataSet: DataSet) => {
    try {
      // Set as currently previewing dataset
      setCurrentPreviewDataSet(dataSet);
      console.log("Previewing dataset:", dataSet.name);
      // TODO: Implement actual preview functionality when backend is ready
    } catch (error) {
      console.error("Error previewing dataset:", error);
    }
  };

  const handleDataSetSelect = (dataSet: DataSet) => {
    setSelectedDataSets((prevDataSets) => {
      const isSelected = prevDataSets.some((ds) => ds.id === dataSet.id);
      return isSelected
        ? prevDataSets.filter((ds) => ds.id !== dataSet.id)
        : [...prevDataSets, dataSet];
    });
  };

  const canPreview = (fileType: string) => {
    return [
      "csv",
      "xlsx",
      "xls",
      "json",
      "jsonl",
      "txt",
      "tsv",
      "xml",
    ].includes(fileType.toLowerCase());
  };

  const handleUseForTraining = () => {
    if (selectedDataSets.length > 0) {
      console.log(
        "Using datasets for training:",
        selectedDataSets.map((ds) => ds.name)
      );
      // TODO: Implement training initiation with selected datasets
      // This could trigger the training process or move datasets to a training queue
    }
  };

  if (!uploadedDataSets.length) {
    return (
      <div className="p-2 bg-surface-file-area border border-border-file-area rounded text-text-default text-center">
        No training datasets uploaded yet.
      </div>
    );
  }

  return (
    <div className="bg-surface-file-area border border-border-file-area rounded p-2">
      <h3 className="text-lg font-semibold text-text-default mb-2">
        Training Datasets
      </h3>

      <div className="max-h-[300px] overflow-y-auto bg-gray-850 rounded overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-850 text-text-default text-sm">
            <tr>
              <th className="px-2 text-left w-12"></th>
              <th className="px-2 text-left">Name</th>
              <th className="px-2 text-left">Status</th>
              <th className="px-2 text-left">Type</th>
              <th className="px-2 text-left">Date Created</th>
              <th className="px-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {uploadedDataSets.map((dataSet) => (
              <tr
                key={dataSet.id}
                className={`cursor-pointer hover:bg-gray-800 transition-colors
                  ${
                    selectedDataSets.some((ds) => ds.id === dataSet.id)
                      ? "bg-gray-800"
                      : ""
                  }
                  ${
                    currentPreviewDataSet?.id === dataSet.id
                      ? "bg-green-900/20"
                      : ""
                  }
                `}
                onClick={() => handleDataSetSelect(dataSet)}
              >
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedDataSets.some(
                      (ds) => ds.id === dataSet.id
                    )}
                    onChange={() => handleDataSetSelect(dataSet)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 appearance-none checked:appearance-auto text-blue-600 bg-gray-800 rounded border-gray-200 border focus:ring-blue-500"
                  />
                </td>
                <td className="p-2 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-300" />
                  <span className="text-text-default text-sm">
                    {dataSet.name}
                  </span>
                </td>
                <td className="p-2">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-green-400 mr-2"></div>
                    <span className="text-sm text-text-default">Ready</span>
                  </div>
                </td>
                <td className="p-2 text-sm text-text-default uppercase">
                  {dataSet.type}
                </td>
                <td className="p-2 text-sm text-text-default">
                  {dataSet.dateCreated}
                </td>
                <td className="p-2">
                  {canPreview(dataSet.type) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        previewDataSet(dataSet);
                      }}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        currentPreviewDataSet?.id === dataSet.id
                          ? "bg-green-600 text-white"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {currentPreviewDataSet?.id === dataSet.id
                        ? "Previewing"
                        : "Preview"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedDataSets.length > 0 && (
        <div className="mt-2 p-2 rounded border border-border-accent bg-gray-850">
          <p className="text-sm text-text-default mb-2">
            {selectedDataSets.length} dataset
            {selectedDataSets.length !== 1 ? "s" : ""} selected
          </p>
          <button
            onClick={handleUseForTraining}
            className="w-full px-4 py-2 bg-surface-navigation hover:bg-button-hover-navigation text-button-navigation rounded transition-colors"
          >
            Use for Training
          </button>
        </div>
      )}
    </div>
  );
}
