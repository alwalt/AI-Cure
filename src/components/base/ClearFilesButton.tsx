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
      iconClassName="h-6 w-6 translate-y-1"
      onClick={handleClick}
      aria-label="Clear all files" // Accessible label for screen readers
      className="focus:outline-none focus:ring-2 focus:ring-primaryWhite" // Focus ring for keyboard navigation
      spanClassName="left-1/2 -translate-x-1/2"
      tooltipId="tooltip-clear-all-files"
    />
  );
}
