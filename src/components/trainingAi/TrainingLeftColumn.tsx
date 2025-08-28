import FilesManager from "@/components/leftColumn/filesArea/FilesManager";
import HyperparameterSettings from "@/components/HyperparameterSettings";

export default function TrainingLeftColumn() {
  return (
    <div
      data-cy="left-column"
      className="overflow-y-auto overflow-x-hidden bg-background-default pt-2 pr-2 pl-2 h-full space-y-4 last:mb-0"
    >
      <FilesManager />
      <HyperparameterSettings />
    </div>
  );
}
