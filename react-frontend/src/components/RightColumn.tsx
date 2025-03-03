import { ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import { ChevronDoubleLeftIcon } from "@heroicons/react/24/outline";
interface RightColumnProps {
  toggleRightColumn: () => void;
  isRightColumnVisible: boolean;
}

export default function RightColumn({
  toggleRightColumn,
  isRightColumnVisible,
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
        <>
          <p>Placeholder for where other Left Col Components will go</p>
        </>
      )}
    </div>
  );
}
