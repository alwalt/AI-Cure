import {
  ChevronDoubleRightIcon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/outline";
import TablePreviewer from "./TablePreviewer";
import { useState, useEffect } from "react";
import { useSessionFileStore } from "@/store/useSessionFileStore";
import SummaryViewer from "./SummaryViewer";
import { useIsRightVisible } from "@/store/useIsRightVisible";

export default function RightColumn() {
  const previewFile = useSessionFileStore((state) => state.previewFile);
  const sessionId = useSessionFileStore((state) => state.sessionId);
  const previewCsv = useSessionFileStore((state) => state.previewCsv);
  const [objectUrl, setObjectUrl] = useState<string>("");

  const isRightColumnVisible = useIsRightVisible(
    (state) => state.isRightColumnVisible
  );
  const toggleRightColumn = useIsRightVisible(
    (state) => state.toggleRightColumn
  );

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
          <h3 className="p-3 bg-selectedBlack text-primaryWhite font-medium border-b">
            {name}
          </h3>
          <iframe src={objectUrl} className="w-full flex-1" title={name} />
        </div>
      );
    } else if (type === "png" || type === "jpg" || type === "jpeg") {
      return (
        <div className="h-full w-full bg-panelBlack rounded-lg overflow-hidden flex flex-col">
          <h3 className="p-2 bg-selectedBlack text-primaryWhite font-medium border-b">
            {name}
          </h3>
          <div className="p-2 flex items-center justify-center bg-selectedBlack flex-1">
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
      <div className="relative group">
        <button
          onClick={toggleRightColumn}
          className="text-primaryWhite rounded"
        >
          {isRightColumnVisible ? (
            <ChevronDoubleRightIcon className="h-8 w-8" />
          ) : (
            <ChevronDoubleLeftIcon className="h-8 w-8" />
          )}
        </button>
        {/* Tooltip */}
        <span
          className={`absolute top-full mt-1 whitespace-nowrap rounded bg-primaryBlack border-primaryWhite border text-xs text-primaryWhite opacity-0 transition-opacity group-hover:opacity-100 px-2 py-1 
      ${
        isRightColumnVisible ? "left-1/2 -translate-x-1/2" : "left-0 ml-[-30px]"
      }`}
        >
          {isRightColumnVisible ? "Collapse" : "Expand"}
        </span>
      </div>

      {isRightColumnVisible && (
        <div className="p-2 w-full">
          <TablePreviewer />
          {renderFilePreview()}
          <SummaryViewer
            csvFilename={previewCsv || ""}
            file={previewFile?.file}
            fileName={previewFile?.name || ""}
          />
        </div>
      )}
    </div>
  );
}
