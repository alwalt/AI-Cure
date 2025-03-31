import SaveButton from "@/components/base/SaveButton";

export default function CollectionMangaer() {
  return (
    <div className="space-y-2">
      <div className="flex justify-between w-full">
        <h2 className="text-2xl font-bold text-primaryWhite">Collections</h2>
        <SaveButton />
      </div>
      <div className="min-h-[200px] border-grey border rounded">
        <p className="p-2"> place holder collections container</p>
      </div>
    </div>
  );
}
