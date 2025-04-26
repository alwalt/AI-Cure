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
  Description: InformationCircleIcon,
  Studies: SquaresPlusIcon,
  Payloads: ArrowUpCircleIcon,
  "Subjects/Biospecimens": BugAntIcon, // must be wrapped in quotes due to /
  Hardware: RectangleStackIcon,
  Publications: BookOpenIcon,
  Files: DocumentArrowDownIcon,
  "Version history": AdjustmentsVerticalIcon,
  Experiments: ClipboardDocumentListIcon,
  Mission: RocketLaunchIcon,
  Protocols: ClipboardIcon,
  Samples: BeakerIcon,
  Assays: ListBulletIcon,
  Vizualization: ChartBarSquareIcon,
};
