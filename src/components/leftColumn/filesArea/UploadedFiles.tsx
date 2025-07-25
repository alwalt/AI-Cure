"use client";
import { UploadedFile } from "@/types/files";
import { useSessionFileStore } from "@/store/useSessionFileStore";
import { UploadedFilesProps } from "@/types/files";
import { apiBase } from "@/lib/api";

export default function UploadedFiles({
  files,
  currentPreviewFile,
}: UploadedFilesProps) {
  // Retrieve Zustand state values & actions
  const selectedFiles = useSessionFileStore((state) => state.selectedFiles);
  const setSelectedFiles = useSessionFileStore(
    (state) => state.setSelectedFiles
  );
  const handleFilePreview = useSessionFileStore(
    (state) => state.handleFilePreview
  );
  const addToCollectionFiles = useSessionFileStore(
    (state) => state.addToCollectionFiles
  );

  const previewFile = async (file: UploadedFile) => {
    try {
      const response = await fetch(`${apiBase}/api/get_file/${file.name}`, {
        credentials: "include",
      });

      const blob = await response.blob();
      const fileType = blob.type;
      // convert mime type to file type
      const newFileType = fileType.split("/").pop() || "";
      const fileObj = new File([blob], file.name, { type: fileType });

      handleFilePreview({
        ...file,
        type: newFileType,
        file: fileObj,
      });
    } catch (error) {
      console.error("Error previewing file:", error);
    }
  };

  const handleFileSelect = (file: UploadedFile) => {
    setSelectedFiles((prevFiles) => {
      const isSelected = prevFiles.some((f) => f.name === file.name);
      return isSelected
        ? prevFiles.filter((f) => f.name !== file.name)
        : [...prevFiles, file];
    });
  };

  const canPreview = (fileType: string) => {
    return ["pdf", "png", "jpg", "jpeg", "xlsx", "xls", "csv"].includes(
      fileType.toLowerCase()
    );
  };

  const handleAddToCollectionClick = () => {
    if (selectedFiles.length > 0) {
      addToCollectionFiles(selectedFiles);
      console.log(
        "Added to collection (UploadedFiles):",
        selectedFiles.map((f) => f.name)
      );
      setSelectedFiles([]);
    }
  };

  if (!files.length) {
    return (
      <div className="p-2 bg-unSelectedBlack rounded text-primaryWhite text-center">
        No files uploaded yet.
      </div>
    );
  }

  return (
    <div className="bg-panelBlack border-grey border rounded p-2">
      <h3 className="text-lg font-semibold text-primaryWhite">
        Uploaded Files
      </h3>

      <div className="max-h-[300px] overflow-y-auto bg-unselectedBlack rounded overflow-auto">
        {/* ^^ overflow-auto add for overflow bug, we need to be able to scroll here */}
        <table className="w-full">
          <thead className="bg-unselectedBlack text-primaryWhite text-sm">
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
            {files.map((file) => (
              <tr
                key={file.name}
                className={`cursor-pointer hover:bg-selectedBlack
                  ${
                    selectedFiles.some((f) => f.name === file.name)
                      ? "bg-selectedBlack"
                      : ""
                  }
                  ${
                    currentPreviewFile?.name === file.name ? "bg-green-100" : ""
                  }
                `}
                onClick={() => handleFileSelect(file)}
              >
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedFiles.some((f) => f.name === file.name)}
                    onChange={() => handleFileSelect(file)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 appearance-none checked:appearance-auto text-blue-600 bg-unSelectedBlack rounded border-brightGrey border focus:ring-blue-500"
                  />
                </td>
                <td className="p-2 flex items-center gap-2">
                  {getFileIcon(file.type)}
                  <span className="text-primaryWhite text-sm">{file.name}</span>
                </td>
                <td className="p-2">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-green-400 mr-2"></div>
                    <span className="text-sm text-primaryWhite">Ready</span>
                  </div>
                </td>
                <td className="p-2 text-sm text-primaryWhite">{file.type}</td>
                <td className="p-2 text-sm text-primaryWhite">
                  {file.dateCreated}
                </td>
                <td className="p-2">
                  {canPreview(file.type) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        previewFile(file);
                      }}
                      className={`px-2 py-1 ${
                        currentPreviewFile?.name === file.name
                          ? "bg-green-500"
                          : "bg-blue-500"
                      } text-white text-xs rounded hover:bg-blue-600`}
                    >
                      {currentPreviewFile?.name === file.name
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

      {selectedFiles.length > 0 && (
        <div className="mt-2 p-2 rounded border-grey border bg-unSelectedBlack">
          <p className="text-sm text-primaryWhite bg-unSelectedBlack mb-2">
            {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""}{" "}
            selected
          </p>
          <button
            onClick={handleAddToCollectionClick}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-primaryWhite rounded transition-colors"
          >
            Add to Collection
          </button>
        </div>
      )}
    </div>
  );
}

function getFileIcon(fileType: string) {
  switch (fileType.toLowerCase()) {
    case "pdf":
      return (
        <div className="w-5 h-5 flex items-center justify-center text-red-500 text-xs">
          PDF
        </div>
      );
    case "png":
    case "jpg":
    case "jpeg":
      return (
        <div className="w-5 h-5 flex items-center justify-center text-blue-500 text-xs">
          IMG
        </div>
      );
    case "xlsx":
    case "xls":
      return (
        <div className="w-5 h-5 flex items-center justify-center text-green-500 text-xs">
          XLS
        </div>
      );
    case "csv":
      return (
        <div className="w-5 h-5 flex items-center justify-center text-gray-500 text-xs">
          CSV
        </div>
      );
    default:
      return (
        <div className="w-5 h-5 flex items-center justify-center text-gray-400 text-xs">
          FILE
        </div>
      );
  }
}
