import FilesManager from "@/components/leftColumn/filesArea/FilesManager";

export default function TrainingLeftColumn() {
  return (
    <div
      data-cy="left-column"
      className="overflow-y-auto bg-background-default pt-2 pr-2 pl-2 h-full space-y-4 last:mb-0"
    >
      <FilesManager />
    </div>
  );
}
