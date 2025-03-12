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
