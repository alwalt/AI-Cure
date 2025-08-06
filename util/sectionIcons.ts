import {
  Info,
  NotebookPen,
  Compass,
  Microscope,
  Rocket,
  Hammer,
  BookOpenText,
  FileDown,
  ChartGantt,
  ClipboardList,
  Clipboard,
  FlaskConical,
  List,
  ChartColumn,
  KeyRound,
  ClipboardType,
} from "lucide-react";

export const sectionIcons: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  description: Info,
  studies: NotebookPen,
  payloads: Compass,
  "subjects/biospecimens": Microscope, // must be wrapped in quotes due to /
  hardware: Hammer,
  publications: BookOpenText,
  files: FileDown,
  "version history": ChartGantt,
  experiments: ClipboardList,
  mission: Rocket,
  protocols: Clipboard,
  samples: FlaskConical,
  assays: List,
  visualization: ChartColumn,
  keywords: KeyRound,
  title: ClipboardType,
};
