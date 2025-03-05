import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

type SaveButtonProps = {
  onClick?: () => void;
};

export default function SaveButton({ onClick }: SaveButtonProps) {
  const handleClick = () => {
    alert("Save button clicked! (Placeholder alert)");
    if (onClick) onClick();
  };

  return (
    <div className="relative group">
      {/* Button */}
      <button onClick={handleClick} className="flex">
        <ArrowDownTrayIcon className="h-8 w-8 stroke-primaryWhite stroke-1 text-primaryBlack hover:stroke-redFill transition-colors duration-300" />
      </button>

      {/* Tooltip (appears on hover) */}
      <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-primaryBlack border-primaryWhite border text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 px-2 py-1">
        Save
      </span>
    </div>
  );
}
