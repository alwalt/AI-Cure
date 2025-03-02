import { FolderPlusIcon } from "@heroicons/react/24/solid";

type FolderPlusButtonProps = {
  onClick?: () => void;
};

export default function FolderPlusButton({ onClick }: FolderPlusButtonProps) {
  const handleClick = () => {
    alert("Folder added! (Placeholder alert)");
    if (onClick) onClick();
  };

  return (
    <div className="relative group">
      {/* Button */}
      <button
        onClick={handleClick}
        className="flex transition hover:stroke-blue-700"
      >
        <FolderPlusIcon className="h-8 w-8 stroke-primaryWhite stroke-1 text-primaryBlack p-1" />
      </button>

      {/* Tooltip (appears on hover) - Hover is not working */}
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-blue-700 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
        Add Folder
      </span>
    </div>
  );
}
