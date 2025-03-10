"use client";
import { useState } from "react";
import LeftColumn from "./LeftColumn";
import RightColumn from "./RightColumn";
import MiddleTopColumn from "./MiddleTopColumn";
import MiddleBottomColumn from "./MiddleBottomColumn";
import FilesManager from "./FilesManager";
import { UploadedFile } from "@/types/files";

export default function AicureToolFull() {
  const [showRight, setShowRight] = useState(true);
  const [previewCsv, setPreviewCsv] = useState<string | undefined>(undefined);
  const [sessionId, setSessionId] = useState<string>("");
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

  const toggleRightColumn = () => setShowRight((prev) => !prev);

  const handlePreview = (csvFilename: string, currentSessionId: string) => {
    setPreviewCsv(csvFilename);
    setSessionId(currentSessionId);
    // Clear any file preview when showing CSV
    setPreviewFile(null);
  };

  const handleFilePreview = (file: UploadedFile | null) => {
    setPreviewFile(file);
    // Clear CSV preview when showing a file
    if (file) {
      setPreviewCsv(undefined);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4">
        <LeftColumn 
          onPreview={handlePreview} 
          onFilePreview={handleFilePreview}
        />
      </div>

      <div className="flex flex-col h-screen flex-grow">
        <div className="h-3/4">
          <MiddleTopColumn />
        </div>
        <div className="flex-grow">
          <MiddleBottomColumn />
        </div>
      </div>

      <div className={`${showRight ? "w-1/4" : "w-10"} flex h-full`}>
        <RightColumn
          toggleRightColumn={toggleRightColumn}
          isRightColumnVisible={showRight}
          sessionId={sessionId}
          previewCsv={previewCsv}
          previewFile={previewFile}
        />
      </div>
    </div>
  );
}
