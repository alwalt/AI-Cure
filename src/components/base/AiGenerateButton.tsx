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
      iconClassName="h-8 w-8 p-1"
      onClick={handleClick}
    />
  );
}
