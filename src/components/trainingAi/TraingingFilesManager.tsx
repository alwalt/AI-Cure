import ClearFilesButton from "@/components/base/ClearFilesButton";
import TrainingUploadDataSetButton from "@/components/base/TrainingUploadDataSetsButton";
import TrainingUploadedDataSets from "@/components/trainingAi/TrainingUploadedDataSets";

export default function TrainingFilesManager() {
  return (
    <div className="space-y-2 last:mb-0">
      <div className="flex justify-between w-full">
        <h2 className="text-2xl font-bold text-text-default">
          Training Datasets
        </h2>
        <div className="flex justify-content">
          <TrainingUploadDataSetButton />
          <ClearFilesButton />
        </div>
      </div>
      <TrainingUploadedDataSets />
    </div>
  );
}
