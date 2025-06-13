import Button from "@/components/base/Button";
import { apiBase } from "@/lib/api";
import { useSessionFileStore } from "@/store/useSessionFileStore";
import { TrashIcon } from "@heroicons/react/24/outline";
import axios from "axios";

export default function ClearFilesButton() {
  const clearAllFiles = useSessionFileStore((state) => state.clearAllFiles);
  
  const handleClick = async () => {
    try {
      const response = await axios.post(`${apiBase}/api/clear_files`, {}, {
        withCredentials: true
      });
      
      if (response.status === 200) {
        // Clear frontend state
        clearAllFiles();
        
        // Refresh the page to ensure clean state
        window.location.reload();
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
      Icon={TrashIcon}
      iconClassName="h-8 w-8"
      onClick={handleClick}
      aria-label="Clear all files" // Accessible label for screen readers
      role="button" // Explicitly defines the role as a button (this is usually implied for <button> elements)
      className="focus:outline-none focus:ring-2 focus:ring-primaryWhite" // Focus ring for keyboard navigation
      spanClassName="left-1/2 -translate-x-1/2"
    />
  );
}
