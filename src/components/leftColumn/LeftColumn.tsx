import FilesManager from "./FilesArea/FilesManager";
import CollectionManager from "./CollectionsArea/CollectionManager";

export default function LeftColumn() {
  return (
    <div className="bg-primaryBlack border-r-2 border-gray-700 p-2 h-full space-y-8">
      <FilesManager />
      <CollectionManager />
    </div>
  );
}
