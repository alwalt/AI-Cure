import { useState } from "react";
import TableList from "./TableList";
import UploadFileButton from "@/components/base/UploadFileButton";
import FolderPlusButton from "./base/FolderPlusButton";
import PlayButton from "./base/PlayButton";
import UploadedFiles from "./UploadedFiles";
import { Table, UploadedFile } from "@/types/files";

interface FilesManagerProps {
  onPreview: (csvFilename: string, sessionId: string) => void;
  onFilePreview: (file: UploadedFile | null) => void;
}

export default function FilesManager({ onPreview, onFilePreview }: FilesManagerProps) {
  const [uploadedTables, setUploadedTables] = useState<Table[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [currentPreviewFile, setCurrentPreviewFile] = useState<UploadedFile | null>(null);

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

  const handleFilePreview = (file: UploadedFile | null) => {
    // When a file is selected for preview, clear any CSV previews
    if (file) {
      setCurrentPreviewFile(file);
      onFilePreview(file);
    } else {
      setCurrentPreviewFile(null);
      onFilePreview(null);
    }
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
      <UploadedFiles 
        files={uploadedFiles}
        onFilePreview={handleFilePreview}
        currentPreviewFile={currentPreviewFile}
      />
      <TableList
        tables={uploadedTables}
        sessionId={sessionId}
        onPreview={(csvFilename, sessionId) => {
          // Clear any file previews when a CSV is previewed
          setCurrentPreviewFile(null);
          onPreview(csvFilename, sessionId);
        }}
      />
    </div>
  );
}
