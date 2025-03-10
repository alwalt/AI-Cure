"use client";
import { useState } from "react";
import LeftColumn from "./LeftColumn";
import RightColumn from "./RightColumn";
import MiddleTopColumn from "./MiddleTopColumn";
import MiddleBottomColumn from "./MiddleBottomColumn";
import { useSessionFileStore } from "@/store/useSessionFileStore"; // Import the store

export default function AicureToolFull() {
  const [showRight, setShowRight] = useState(true);
  //   const [previewCsv, setPreviewCsv] = useState<string | undefined>(undefined);
  //   const [sessionId, setSessionId] = useState<string>("");
  const { sessionId, previewCsv, setSessionId, setPreviewCsv } =
    useSessionFileStore(); // Use the store

  const toggleRightColumn = () => setShowRight((prev) => !prev);

  const handlePreview = (csvFilename: string, currentSessionId: string) => {
    setPreviewCsv(csvFilename);
    setSessionId(currentSessionId);
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4">
        <LeftColumn onPreview={handlePreview} />
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
          //   sessionId={sessionId}
          //   previewCsv={previewCsv}
        />
      </div>
    </div>
  );
}
