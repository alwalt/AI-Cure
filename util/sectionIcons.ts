import {
  AlignLeft,
  BarChart3,
  Beaker,
  List,
  MessageSquareText,
  ClipboardList,
  Compass,
  Clipboard,
  BookOpenText,
  FileDown,
  SquareChartGantt,
  Info,
} from "lucide-react";

export const sectionIcons: Record<string, any> = {
  description: Info,
  title: MessageSquareText,
  keywords: AlignLeft,
  experiments: ClipboardList,
  payloads: Compass,
  protocols: Clipboard,
  samples: Beaker,
  assays: List,
  publications: BookOpenText,
  files: FileDown,
  "version history": SquareChartGantt,
  vizualization: BarChart3,
};
