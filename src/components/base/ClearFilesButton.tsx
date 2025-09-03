import Button from "@/components/base/Button";
import { apiBase } from "@/lib/api";
import { useSessionFileStore } from "@/store/useSessionFileStore";
import { Trash } from "lucide-react";
import axios from "axios";

export default function ClearFilesButton() {
  const clearAllFiles = useSessionFileStore((state) => state.clearAllFiles);

  const handleClick = async () => {
    try {
      const response = await axios.post(
        `${apiBase}/api/clear_files`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        // Clear frontend state
        clearAllFiles();

        // State is already cleared using clearAllFiles()
      } else {
        alert("Failed to clear files");
      }
    } catch (error) {
      console.error("Error clearing files:", error);
      alert("Failed to clear files");
    }
  };

  return (
    <Button
      targetId="ClearFilesButton"
      buttonDescription="Clear All Files"
      Icon={Trash}
      iconClassName="h-6 w-6 translate-y-1 stroke-primaryWhite stroke-1 text-primaryBlack  hover:stroke-redFill transition-colors duration-300"
      onClick={handleClick}
      aria-label="Clear all files" // Accessible label for screen readers
      className="focus-ring:translate-y-1" // className must be present in props
      spanClassName="right-0"
      tooltipId="tooltip-clear-all-files"
    />
  );
}
