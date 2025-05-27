import FilesManager from "@/components/leftColumn/filesArea/FilesManager";
import CollectionManager from "@/components/leftColumn/collectionsArea/CollectionManager";

export default function LeftColumn() {
  return (
    <div className="overflow-y-auto bg-primaryBlack border-r-2 border-gray-700 p-2 h-full space-y-8 last:mb-0">
      <FilesManager />
      <CollectionManager />
    </div>
  );
}
