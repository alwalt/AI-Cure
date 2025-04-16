import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import Button from "@/components/base/Button";

// type SaveButtonProps = {
//   onClick?: () => void;
// };

export default function SaveButton() {
  const handleClick = () => {
    alert("Save button clicked! (Placeholder alert)");
  };

  return (
    <Button
      targetId="SaveButton"
      buttonDescription="Save"
      Icon={ArrowDownTrayIcon}
      iconClassName="h-8 w-8"
      onClick={handleClick}
    />
  );
}
