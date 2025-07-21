import Button from "./Button";
import { Wand } from "lucide-react";

interface AiGenerateButtonProps {
  onClick?: () => Promise<void> | void;
  disabled: boolean;
}

export default function AiGenerateButton({ onClick }: AiGenerateButtonProps) {
  return (
    <Button
      targetId="Ai-generate-button"
      buttonDescription="AI generate"
      Icon={Wand}
      iconClassName="stroke-primaryWhite stroke-1 text-primaryBlack  hover:stroke-redFill transition-colors duration-300 h-8 w-8 p-1 border border-primaryWhite rounded-lg hover:border-redFill hover:border"
      onClick={onClick} //pass the async function
      aria-label="Generate content with AI" // Accessible label for screen readers
      role="button" // Explicitly defines the role as a button (this is usually implied for <button> elements)
      className="focus:outline-none focus:ring-2 focus:ring-primaryWhite" // Focus ring for keyboard navigation
      spanClassName="static ml-10 -translate-y-8"
      tooltipId="tooltip-ai-generate"
    />
  );
}
