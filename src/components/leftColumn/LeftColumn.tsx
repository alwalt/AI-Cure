import FilesManager from "./filesArea/FilesManager";
import CollectionMangaer from "./collectionsArea/CollectionManager";

export default function LeftColumn() {
  return (
    <div className="bg-primaryBlack border-r-2 border-gray-700 p-2 h-full space-y-8">
      <FilesManager />
      <CollectionMangaer />
    </div>
  );
}
