import FilesManager from "./FilesManager";
import CollectionMangaer from "./CollectionManager";
import { UploadedFile } from "@/types/files";

interface LeftColumnProps {
  onPreview: (csvFilename: string, sessionId: string) => void;
  onFilePreview: (file: UploadedFile | null) => void;
}

export default function LeftColumn({ onPreview, onFilePreview }: LeftColumnProps) {
  return (
    <div className="bg-primaryBlack border-blue-500 border-2 p-4 h-full space-y-8">
      <FilesManager 
        onPreview={onPreview} 
        onFilePreview={onFilePreview}
      />
      <CollectionMangaer />
    </div>
  );
}
