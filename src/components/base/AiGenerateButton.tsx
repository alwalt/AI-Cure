import Button from "./Button";
import { SparklesIcon } from "@heroicons/react/24/outline";

export default function AiGenerateButton() {
  const handleClick = () => {
    alert("Ai generate in future updates");
  };
  return (
    <Button
      targetId="FolderPlusButton"
      buttonDescription="AI generate"
      Icon={SparklesIcon}
      iconClassName="h-8 w-8 p-1 border border-primaryWhite rounded-lg hover:border-redFill hover:border"
      onClick={handleClick}
      aria-label="Generate content with AI" // Accessible label for screen readers
      role="button" // Explicitly defines the role as a button (this is usually implied for <button> elements)
      className="focus:outline-none focus:ring-2 focus:ring-primaryWhite" // Focus ring for keyboard navigation
    />
  );
}
