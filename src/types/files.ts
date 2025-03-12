export interface UploadedFile {
  name: string;
  type: string;
  dateCreated: string;
  size: number;
  file: File;
  selected?: boolean;
}

export interface Table {
  csv_filename: string;
  display_name: string;
}

export interface UploadResponse {
  session_id: string;
  tables: Table[];
}

export interface UploadFileButtonProps {
  onTablesUpdate: (tables: Table[]) => void;
  onSessionUpdate: (sessionId: string) => void;
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
  sessionId: string;
  csvFilename: string | undefined;
}

export interface AnalysisResponse {
  summary: string;
  keywords: string[];
  error?: string;
}

export interface PreviewResponse {
  columns: string[];
  preview: Array<Record<string, any>>;
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
