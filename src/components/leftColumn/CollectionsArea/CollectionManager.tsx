import SaveButton from "@/components/base/SaveButton";
import { useSessionFileStore } from "@/store/useSessionFileStore"; 
import { UploadedFile } from "@/types/files"; 

export default function CollectionManager() {
  // Get files from Zustand 
  const collectionFiles = useSessionFileStore((state) => state.collectionFiles);

  return (
    <div className="space-y-2">
      <div className="flex justify-between w-full">
        <h2 className="text-2xl font-bold text-primaryWhite">Collections</h2>
        <SaveButton />
      </div>
      <div className="min-h-[200px] border-grey border rounded bg-black p-2">
        {collectionFiles.length === 0 ? (
          <p className="p-2 text-gray-400">No files in collection yet.</p>
        ) : (
          <ul className="space-y-1">
            {collectionFiles.map((file: UploadedFile) => (
              <li
                key={file.name} // Using a unique key to prevent duplicate files
                className="text-sm text-primaryWhite bg-unSelectedBlack p-2 rounded border border-grey"
              >
                {file.name} ({file.type})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
