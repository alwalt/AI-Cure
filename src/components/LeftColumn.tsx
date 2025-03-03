import FilesManager from "./FilesManager";
import CollectionMangaer from "./CollectionManager";

interface LeftColumnProps {
  onPreview: (csvFilename: string, sessionId: string) => void;
}

export default function LeftColumn({ onPreview }: LeftColumnProps) {
  return (
    <div className="bg-primaryBlack border-blue-500 border-2 p-4 h-full space-y-8">
      <FilesManager onPreview={onPreview} />
      <CollectionMangaer />
    </div>
  );
}
