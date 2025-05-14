import {
  InformationCircleIcon,
  SquaresPlusIcon,
  ArrowUpCircleIcon,
  RocketLaunchIcon,
  BugAntIcon,
  RectangleStackIcon,
  BookOpenIcon,
  DocumentArrowDownIcon,
  AdjustmentsVerticalIcon,
  ClipboardDocumentListIcon,
  ClipboardIcon,
  BeakerIcon,
  ListBulletIcon,
  ChartBarSquareIcon,
} from "@heroicons/react/24/outline";

export const sectionIcons: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  description: InformationCircleIcon,
  studies: SquaresPlusIcon,
  Ppayloads: ArrowUpCircleIcon,
  "subjects/biospecimens": BugAntIcon, // must be wrapped in quotes due to /
  hardware: RectangleStackIcon,
  publications: BookOpenIcon,
  files: DocumentArrowDownIcon,
  "version history": AdjustmentsVerticalIcon,
  experiments: ClipboardDocumentListIcon,
  mission: RocketLaunchIcon,
  protocols: ClipboardIcon,
  samples: BeakerIcon,
  assays: ListBulletIcon,
  vizualization: ChartBarSquareIcon,
};
