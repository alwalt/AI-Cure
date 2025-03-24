import { useState, useEffect } from "react";
import TableList from "./TableList";
import UploadFileButton from "@/components/base/UploadFileButton";
import FolderPlusButton from "./base/FolderPlusButton";
import PlayButton from "./base/PlayButton";
import { useSessionFileStore } from "@/store/useSessionFileStore"; // Import the store
import UploadedFiles from "./UploadedFiles";
import { Table as TableType, UploadedFile } from "@/types/files";
import axios from "axios";

export default function FilesManager() {
  const [uploadedTables, setUploadedTables] = useState<TableType[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // for gathering current session files
  useEffect(() => {
    const fetchSessionFiles = async () => {
      try {
        const response = await axios.get<{ files: UploadedFile[] }>(
          "http://localhost:8000/api/get_session_files",
          { withCredentials: true }
        );
        
        if (response.data.files) {
          handleFilesUpdate(response.data.files.map(file => ({
            name: file.name,
            type: file.type,
            dateCreated: file.dateCreated,
            size: file.size,
          })));
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

  return (
    <div className="space-y-2">
      <div className="flex justify-between w-full">
        <h2 className="text-2xl font-bold text-primaryWhite">Files</h2>
        <div className="flex justify-content">
          <UploadFileButton
            onTablesUpdate={handleTablesUpdate}
            // onSessionUpdate={setSessionId}
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
          />
          <TableList tables={uploadedTables} />
        </>
      )}
    </div>
  );
}
