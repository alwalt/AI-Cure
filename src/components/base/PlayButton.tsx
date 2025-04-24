import { PlayIcon } from "@heroicons/react/24/outline";
import Button from "@/components/base/Button";

export default function PlayButton() {
  const handleClick = () => {
    alert("You clicked the play button! (Placeholder alert)");
  };

  return (
    <Button
      targetId="PlayButton"
      buttonDescription="Play"
      Icon={PlayIcon}
      iconClassName="h-8 w-8"
      onClick={handleClick}
      aria-label="Generate vector store" // Accessible label for screen readers
      role="button" // Explicitly defines the role as a button (this is usually implied for <button> elements)
      className="focus:outline-none focus:ring-2 focus:ring-primaryWhite" // Focus ring for keyboard navigation
      spanClassName="left-1/2 -translate-x-1/2"
    />
  );
}
