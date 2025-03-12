import FilesManager from "./FilesManager";
import CollectionMangaer from "./CollectionManager";

export default function LeftColumn() {
  return (
    <div className="bg-primaryBlack border-blue-500 border-2 p-4 h-full space-y-8">
      <FilesManager />
      <CollectionMangaer />
    </div>
  );
}
