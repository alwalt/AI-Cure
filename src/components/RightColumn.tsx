import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import { ChevronDoubleLeftIcon } from "@heroicons/react/24/outline";
import TablePreviewer from "./TablePreviewer";

interface RightColumnProps {
  toggleRightColumn: () => void;
  isRightColumnVisible: boolean;
  sessionId: string;
  previewCsv?: string;
}

export default function RightColumn({
  toggleRightColumn,
  isRightColumnVisible,
  sessionId,
  previewCsv,
}: RightColumnProps) {
  return (
    <div className="border-red-500 border-2 bg-primaryBlack flex flex-col items-start w-full">
      <button onClick={toggleRightColumn} className="text-white rounded">
        {isRightColumnVisible ? (
          <ChevronDoubleRightIcon className="h-8 w-8" />
        ) : (
          <ChevronDoubleLeftIcon className="h-8 w-8" />
        )}
      </button>

      {isRightColumnVisible && (
        <div className="p-2">
          {previewCsv && (
            <TablePreviewer sessionId={sessionId} csvFilename={previewCsv} />
          )}
        </div>
      )}
    </div>
  );
}
