"use client";
import Image from "next/image";
import { UploadedFile } from "@/types/files";
import FilePreview from "./FilePreview";
import { useSessionFileStore } from "@/store/useSessionFileStore";

interface UploadedFilesProps {
  files: UploadedFile[];
  currentPreviewFile: UploadedFile | null;
}

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

  const handleFileSelect = (file: UploadedFile) => {
    setSelectedFiles((prevFiles) => {
      const isSelected = prevFiles.some((f) => f.name === file.name);
      return isSelected
        ? prevFiles.filter((f) => f.name !== file.name)
        : [...prevFiles, file];
    });
  };

  const canPreview = (fileType: string) => {
    return ["pdf", "png", "jpg", "jpeg"].includes(fileType.toLowerCase());
  };

  if (!files.length) {
    return (
      <div className="p-2 bg-gray-100 rounded text-gray-500 text-center">
        No files uploaded yet.
      </div>
    );
  }

  return (
    <div className="bg-gray-200 rounded p-2">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Uploaded Files
      </h3>

      <div className="max-h-[300px] overflow-y-auto bg-primaryWhite rounded">
        <table className="w-full">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="p-2 text-left w-12"></th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Date Created</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr
                key={file.name}
                className={`cursor-pointer hover:bg-gray-100
                  ${
                    selectedFiles.some((f) => f.name === file.name)
                      ? "bg-blue-100"
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
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </td>
                <td className="p-2 flex items-center gap-2">
                  {getFileIcon(file.type)}
                  <span className="text-gray-700 text-sm">{file.name}</span>
                </td>
                <td className="p-2">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-green-400 mr-2"></div>
                    <span className="text-sm text-gray-600">Ready</span>
                  </div>
                </td>
                <td className="p-2 text-sm text-gray-600">{file.type}</td>
                <td className="p-2 text-sm text-gray-600">
                  {file.dateCreated}
                </td>
                <td className="p-2">
                  {canPreview(file.type) && (
                    <button
                      onClick={() => handleFilePreview(file)}
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
        <div className="mt-2 p-2 bg-blue-50 rounded border-primaryBlue border">
          <p className="text-sm text-primaryBlue">
            {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""}{" "}
            selected
          </p>
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
