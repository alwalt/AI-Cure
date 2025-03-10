import { useState } from "react";
import TableList from "./TableList";
import UploadFileButton from "@/components/base/UploadFileButton";
import FolderPlusButton from "./base/FolderPlusButton";
import PlayButton from "./base/PlayButton";
import UploadedFiles from "./UploadedFiles";
import { Table, UploadedFile } from "@/types/files";

interface FilesManagerProps {
  onPreview: (csvFilename: string, sessionId: string) => void;
}

export default function FilesManager({ onPreview }: FilesManagerProps) {
  const [uploadedTables, setUploadedTables] = useState<Table[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [sessionId, setSessionId] = useState<string>("");

  const handleTablesUpdate = (tables: Table[]) => {
    setUploadedTables(tables);
  };

  const handleSessionUpdate = (newSessionId: string) => {
    setSessionId(newSessionId);
  };
  
  const handleFilesUpdate = (files: UploadedFile[]) => {
    setUploadedFiles(prev => {
      // Create a map of existing files to avoid duplicates
      const existingFiles = new Map(prev.map(file => [file.name, file]));
      
      // Add new files, replacing existing ones with the same name
      files.forEach(file => {
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
            onSessionUpdate={handleSessionUpdate}
            onFilesUpdate={handleFilesUpdate}
          />
          <FolderPlusButton />
          <PlayButton />
        </div>
      </div>
      <UploadedFiles files={uploadedFiles} />
      <TableList
        tables={uploadedTables}
        sessionId={sessionId}
        onPreview={(csvFilename, sessionId) =>
          onPreview(csvFilename, sessionId)
        }
      />
    </div>
  );
}
