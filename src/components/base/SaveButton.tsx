import { Save } from "lucide-react";
import Button from "@/components/base/Button";

export default function SaveButton() {
  const handleClick = () => {
    alert("Save button clicked! (Placeholder alert)");
  };

  return (
    <Button
      targetId="SaveButton"
      buttonDescription="Save"
      Icon={Save}
      iconClassName="h-7 w-7 stroke-primaryWhite stroke-1 text-primaryBlack  hover:stroke-redFill transition-colors duration-300"
      onClick={handleClick}
      aria-label="Save" // Accessible label for screen reader
      className="focus:outline-none focus:ring-2 focus:ring-primaryWhite " // Focus ring for keyboard navigation
      spanClassName="left-1/2 -translate-x-1/2"
      tooltipId="tooltip-save"
    />
  );
}
