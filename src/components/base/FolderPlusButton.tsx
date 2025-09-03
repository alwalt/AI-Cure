import { FolderPlus } from "lucide-react";
import Button from "@/components/base/Button";
// import ButtonProps from "@/types/files";

export default function FolderPlusButton() {
  const handleClick = () => {
    alert("Folder added! (Placeholder alert)");
  };

  return (
    <Button
      targetId="FolderPlusButton"
      buttonDescription="Add folder"
      Icon={FolderPlus}
      iconClassName="h-8 w-8 p-1"
      onClick={handleClick}
      aria-label="Add folder" // Accessible label for screen readers
      role="button" // Explicitly defines the role as a button (this is usually implied for <button> elements)
      className="focus:outline-none focus:ring-2 focus:ring-primaryWhite" // Focus ring for keyboard navigation
      spanClassName="left-1/2 -translate-x-1/2"
      tooltipId="tooltip-add-folder"
    />
  );
}
