import { useState, useEffect } from "react";
import TableList from "../TableList";
import UploadFileButton from "@/components/base/UploadFileButton";
import FolderPlusButton from "../base/FolderPlusButton";
import PlayButton from "../base/PlayButton";
import UploadedFiles from "../UploadedFiles";
import { Table as TableType, UploadedFile } from "@/types/files";
import axios from "axios";
import { apiBase } from '@/lib/api';


export default function FilesManager() {
  const [uploadedTables, setUploadedTables] = useState<TableType[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);

  // for gathering current session files
  useEffect(() => {
    const fetchSessionFiles = async () => {
      try {
        const response = await axios.get<{ files: UploadedFile[] }>(
          `${apiBase}/api/get_session_files`,
          { withCredentials: true }
        );

        if (response.data.files) {
          handleFilesUpdate(
            response.data.files.map((file) => ({
              name: file.name,
              type: file.type,
              dateCreated: file.dateCreated,
              size: file.size,
            }))
          );
        }
      } catch (err) {
        setError("Failed to load session files");
        console.error("Error fetching session files:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionFiles();
  }, []);

  const [currentPreviewFile, setCurrentPreviewFile] =
    useState<UploadedFile | null>(null);

  const handleTablesUpdate = (tables: TableType[]) => {
    setUploadedTables(tables);
  };

  const handleFilesUpdate = (files: UploadedFile[]) => {
    setUploadedFiles((prev) => {
      // Create a map of existing files to avoid duplicates
      const existingFiles = new Map(prev.map((file) => [file.name, file]));
      // Add new files, replacing existing ones with the same name
      files.forEach((file) => {
        existingFiles.set(file.name, file);
      });

      return Array.from(existingFiles.values());
    });
  };

  const handleFileSelect = (file: UploadedFile, isSelected: boolean) => {
    setSelectedFiles((prevSelectedFiles) => {
      if (isSelected) {
        if (!prevSelectedFiles.find(sf => sf.name === file.name)) {
          return [...prevSelectedFiles, file];
        }
        return prevSelectedFiles;
      } else {
        return prevSelectedFiles.filter((sf) => sf.name !== file.name);
      }
    });
  };

  const handleAddToCollection = () => {
    if (selectedFiles.length > 0) {
      console.log("Adding to collection:", selectedFiles);
      setSelectedFiles([]);
      alert(`${selectedFiles.length} file(s) added to collection (simulated).`);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between w-full">
        <h2 className="text-2xl font-bold text-primaryWhite">Files</h2>
        <div className="flex justify-content">
          <UploadFileButton
            onTablesUpdate={handleTablesUpdate}
            onFilesUpdate={handleFilesUpdate}
          />
          <FolderPlusButton />
          <PlayButton />
        </div>
      </div>
      {!loading && !error && (
        <>
          <UploadedFiles
            files={uploadedFiles}
            currentPreviewFile={currentPreviewFile}
            selectedFiles={selectedFiles}
            onFileSelect={handleFileSelect}
          />
          {selectedFiles.length > 0 && (
            <div className="mt-2 p-2 border border-gray-600 rounded bg-gray-800">
              <p className="text-sm text-gray-300 mb-2">
                {selectedFiles.length} file(s) selected
              </p>
              <button
                onClick={handleAddToCollection}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Add to Collection
              </button>
            </div>
          )}
          <TableList tables={uploadedTables} />
        </>
      )}
    </div>
  );
}
