import { BookmarkIcon } from "@heroicons/react/24/outline";

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
      Icon={BookmarkIcon}
      iconClassName="h-7 w-7"
      onClick={handleClick}
      aria-label="Save" // Accessible label for screen readers
      role="button" // Explicitly defines the role as a button (this is usually implied for <button> elements)
      className="focus:outline-none focus:ring-2 focus:ring-primaryWhite" // Focus ring for keyboard navigation
    />
  );
}
