import {
  ChevronDoubleRightIcon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/outline";
import TablePreviewer from "./TablePreviewer";
import { useState, useEffect } from "react";
import { useSessionFileStore } from "@/store/useSessionFileStore";
import { RightColumnProps } from "@/types/files";
import SummaryViewer from "./SummaryViewer";

export default function RightColumn({
  toggleRightColumn,
  isRightColumnVisible,
}: RightColumnProps) {
  const previewFile = useSessionFileStore((state) => state.previewFile);
  const sessionId = useSessionFileStore((state) => state.sessionId);
  const previewCsv = useSessionFileStore((state) => state.previewCsv);
  const [objectUrl, setObjectUrl] = useState<string>("");

  // Create object URL when previewFile changes
  useEffect(() => {
    if (previewFile?.file) {
      const url = URL.createObjectURL(previewFile.file);
      setObjectUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
    setObjectUrl("");
  }, [previewFile]);

  const renderFilePreview = () => {
    if (!previewFile || !objectUrl) return null;

    const { type, name } = previewFile;

    if (type === "pdf") {
      return (
        <div className="h-full w-full bg-panelBlack rounded-lg overflow-hidden flex flex-col">
          <h3 className="p-3 bg-gray-100 text-gray-800 font-medium border-b">
            {name}
          </h3>
          <iframe src={objectUrl} className="w-full flex-1" title={name} />
        </div>
      );
    } else if (type === "png" || type === "jpg" || type === "jpeg") {
      return (
        <div className="h-full w-full bg-panelBlack rounded-lg overflow-hidden flex flex-col">
          <h3 className="p-2 bg-gray-100 text-primaryWhite font-medium border-b">
            {name}
          </h3>
          <div className="p-2 flex items-center justify-center bg-gray-50 flex-1">
            <img
              src={objectUrl}
              alt={name}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="h-full w-full bg-selectedBlack border-grey border rounded-lg overflow-hidden flex flex-col mb-2">
        <h3 className="bg-selectedBlack text-primaryWhite font-medium border-b pl-2">
          {name}
        </h3>
        <div className="p-2 flex items-center justify-center bg-selectedBlack flex-1">
          <p className="text-primaryWhite">
            Preview not available for this file type
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-primaryBlack border-l-2 border-gray-700 pt-2 flex flex-col items-start w-full">
      <button onClick={toggleRightColumn} className="text-white rounded">
        {isRightColumnVisible ? (
          <ChevronDoubleRightIcon className="h-8 w-8" />
        ) : (
          <ChevronDoubleLeftIcon className="h-8 w-8" />
        )}
      </button>

      {isRightColumnVisible && (
        <div className="p-2 w-full">
          <TablePreviewer />
          {renderFilePreview()}
          <SummaryViewer
            // sessionId={sessionId || ""}
            csvFilename={previewCsv || ""}
            file={previewFile?.file}
            fileName={previewFile?.name || ""}
          />
        </div>
      )}
    </div>
  );
}
