import TrainingFilesManager from "./TraingingFilesManager";
import TraingingHyperparameterSettings from "./TrainingHyperparameters";

export default function TrainingLeftColumn() {
  return (
    <div
      data-cy="left-column"
      className="overflow-y-auto overflow-x-hidden bg-background-default pt-2 pr-2 pl-2 h-full space-y-4 last:mb-0"
    >
      <div className="mb-4">
        <TrainingFilesManager />
      </div>
      <TraingingHyperparameterSettings />
    </div>
  );
}
