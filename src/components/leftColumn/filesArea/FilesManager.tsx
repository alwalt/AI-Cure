import ClearFilesButton from "@/components/base/ClearFilesButton";
import FolderPlusButton from "@/components/base/FolderPlusButton";
import PlayButton from "@/components/base/PlayButton";
import UploadFileButton from "@/components/base/UploadFileButton";
import { apiBase } from "@/lib/api";
import { useSessionFileStore } from "@/store/useSessionFileStore";
import { Table as TableType, UploadedFile } from "@/types/files";
import axios from "axios";
import { useEffect, useState } from "react";
import TableList from "./TableList";
import UploadedFiles from "./UploadedFiles";

export default function FilesManager() {
  const [uploadedTables, setUploadedTables] = useState<TableType[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to the store's lastClearedTimestamp to detect when files are cleared
  const lastClearedTimestamp = useSessionFileStore(
    (state) => state.lastClearedTimestamp
  );

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

  // Clear local state when files are cleared in the store
  useEffect(() => {
    if (lastClearedTimestamp > 0) {
      // Files were cleared, reset local state
      setUploadedFiles([]);
      setUploadedTables([]);
      setLoading(false);
      setError(null);
    }
  }, [lastClearedTimestamp]);

  const [currentPreviewFile] = useState<UploadedFile | null>(null);

  const handleTablesUpdate = (tables: TableType[]) => {
    setUploadedTables(tables);
  };

  const handleFilesUpdate = (files: UploadedFile[]) => {
    setUploadedFiles((prev) => {
      const existingFiles = new Map(prev.map((file) => [file.name, file]));
      files.forEach((file) => {
        existingFiles.set(file.name, file);
      });
      return Array.from(existingFiles.values());
    });
  };

  return (
    <div className="space-y-2 last:mb-0 overflow-hidden">
      <div className="flex justify-between w-full overflow-hidden">
        <h2 className="text-2xl font-bold text-primaryWhite">Files</h2>
        <div className="flex justify-content overflow-hidden">
          <UploadFileButton
            onTablesUpdate={handleTablesUpdate}
            onFilesUpdate={handleFilesUpdate}
          />
          <ClearFilesButton />
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
