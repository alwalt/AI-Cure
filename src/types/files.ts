export interface UploadedFile {
  name: string;
  type: string;
  dateCreated: string;
  size: number;
  file?: File;
  selected?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  files: UploadedFile[];
  isExpanded?: boolean;
}

export interface Table {
  csv_filename: string;
  display_name: string;
}

export interface UploadResponse {
  session_id: string;
  tables: Table[];
}

export interface IngestResponse {
  session_id: string;
  collection_id?: string;
  collection_name?: string;
  files_processed?: number;
}

export interface UploadFileButtonProps {
  onTablesUpdate: (tables: Table[]) => void;
  // onSessionUpdate: (sessionId: string) => void;
  onFilesUpdate: (files: UploadedFile[]) => void;
}

export interface FilePreviewProps {
  file: UploadedFile | null;
  onClose: () => void;
}

export interface RightColumnProps {
  toggleRightColumn: () => void;
  isRightColumnVisible: boolean;
}

export interface SummaryViewerProps {
  // sessionId: string;
  csvFilename: string | undefined;
  file: File | undefined;
  fileName: string | undefined;
}

export interface AnalysisResponse {
  summary: string;
  keywords: string[];
  error?: string;
}

export interface PreviewResponse {
  columns: string[];
  preview: Array<Record<string, string | number>>;
}

export interface UploadedFilesProps {
  files: UploadedFile[];
  currentPreviewFile: UploadedFile | null;
}

export interface FileUploaderProps {
  onTablesUpdate?: (tables: Table[]) => void;
  onSessionUpdate?: (sessionId: string) => void;
  onFilesUpdate?: (files: UploadedFile[]) => void;
}

export interface ButtonProps {
  targetId: string;
  buttonDescription: string;
  onClick?: () => Promise<void> | void; // Allow onClick to return a Promise or nothing
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; // This accepts any Heroicon
  iconClassName?: string; // Optional extra styles
  spanClassName?: string;
  role?: string; // Add role prop (optional)
  "aria-label"?: string; // Optional aria-label for accessibility
  className: string;
  tooltipId: string;
}

export interface TextButtonProps {
  label: string;
  buttonDescription: string;
  onClick?: () => void;
  isActive: boolean;
  buttonClassName?: string;
  spanClassName?: string;
}

export interface FilePreviewerProps {
  file: File | undefined;
  type: string | undefined;
  name: string;
  objectUrl: string;
}

export interface CollapsibleSectionProps {
  title: string;
  onGenerate: () => void;
  value: string;
  onChange: (text: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  initiallyOpen?: boolean;
}

export interface EditableTextAreaProps {
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  rows?: number;
}

export interface RagResponse extends Record<string, string | string[]> {
  description: string;
  title: string;
  keywords: string[];
}

export interface BackendCollection {
  id: string;
  name: string;
  files?: UploadedFile[];
  is_active: boolean;
}

export interface TabButtons {
  id: string;
  label: string;
  description: string;
}

export interface SettingsButtonProps {
  onClick: () => void | Promise<void>;
  className?: string;
  tooltipId?: string;
  ariaLabel?: string;
  iconClassName?: string;
  spanClassName?: string;
  strokeWidth?: number;
}
