import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import TablePreviewer from "./TablePreviewer";
import { useState, useEffect } from "react";
import { useSessionFileStore } from "@/store/useSessionFileStore";
import SummaryViewer from "./SummaryViewer";
import { useIsRightVisible } from "@/store/useIsRightVisible";
import FilePreviewer from "./FilePreviewer";

export default function RightColumn() {
  const previewFile = useSessionFileStore((state) => state.previewFile);
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

  return (
    <div className="bg-primaryBlack border-l-2 border-gray-700 pt-2 flex flex-col items-start w-full">
      <div className="relative group overflow-hidden">
        <button
          onClick={toggleRightColumn}
          className="text-primaryWhite rounded"
        >
          {isRightColumnVisible ? (
            <ChevronRightIcon className="h-8 w-8" />
          ) : (
            <ChevronLeftIcon className="h-8 w-8" />
          )}
        </button>
        {/* Tooltip */}
        <span
          className={`absolute top-full mt-1 whitespace-nowrap rounded bg-primaryBlack border-primaryWhite border text-xs text-primaryWhite opacity-0 transition-opacity group-hover:opacity-100 px-2 py-1 z-20
      ${
        isRightColumnVisible ? "left-1/2 -translate-x-1/2" : "left-0 ml-[-30px]"
      }`}
        >
          {isRightColumnVisible ? "Collapse" : "Expand"}
        </span>
      </div>

      {isRightColumnVisible && (
        <div className="p-2 w-full h-full flex flex-col overflow-hidden gap-2">
          {previewCsv && (
            <div className="flex-1 overflow-auto">
              <TablePreviewer />
            </div>
          )}
          {previewFile && (
            <div className="flex-1 overflow-auto">
              <FilePreviewer
                file={previewFile.file}
                type={previewFile.type}
                name={previewFile.name}
                objectUrl={objectUrl}
              />
            </div>
          )}
          <div className="flex-1 overflow-auto">
            <SummaryViewer
              csvFilename={previewCsv || ""}
              file={previewFile?.file}
              fileName={previewFile?.name || ""}
            />
          </div>
        </div>
      )}
    </div>
  );
}
