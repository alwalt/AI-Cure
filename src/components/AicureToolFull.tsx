"use client";
import { useState } from "react";
import LeftColumn from "./LeftColumn";
import RightColumn from "./RightColumn";
import MiddleTopColumn from "./MiddleTopColumn";
import MiddleBottomColumn from "./MiddleBottomColumn";
import { useSessionFileStore } from "@/store/useSessionFileStore";
import FilesManager from "./FilesManager";
import { UploadedFile } from "@/types/files";

export default function AicureToolFull() {
  const [showRight, setShowRight] = useState(true);

  const sessionId = useSessionFileStore((state) => state.sessionId);
  const previewCsv = useSessionFileStore((state) => state.previewCsv);
  const previewFile = useSessionFileStore((state) => state.previewFile);
  const setSessionId = useSessionFileStore((state) => state.setSessionId);
  const setPreviewCsv = useSessionFileStore((state) => state.setPreviewCsv);
  const setPreviewFile = useSessionFileStore((state) => state.setPreviewFile);

  const toggleRightColumn = () => setShowRight((prev) => !prev);

  const handlePreview = (csvFilename: string, currentSessionId: string) => {
    setPreviewCsv(csvFilename);
    setSessionId(currentSessionId);
    setPreviewFile(null); // Clear any file preview when showing CSV
  };

  const handleFilePreview = (file: UploadedFile | null) => {
    setPreviewFile(file);
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
        />
      </div>
    </div>
  );
}
