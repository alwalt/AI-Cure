import FilesManager from "@/components/leftColumn/filesArea/FilesManager";
import CollectionManager from "@/components/leftColumn/collectionsArea/CollectionManager";

export default function LeftColumn() {
  return (
    <div
      data-cy="left-column"
      className="overflow-y-auto bg-primaryBlack border-r-2 border-gray-700 pt-2 pr-2 pl-2 h-full space-y-4 last:mb-0"
    >
      <FilesManager />
      <CollectionManager />
    </div>
  );
}
