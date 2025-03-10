import { useState } from "react";
import TableList from "./TableList";
import UploadFileButton from "@/components/base/UploadFileButton";
import FolderPlusButton from "./base/FolderPlusButton";
import PlayButton from "./base/PlayButton";
import { useSessionFileStore } from "@/store/useSessionFileStore"; // Import the store

interface Table {
  csv_filename: string;
  display_name: string;
}

interface FilesManagerProps {
  onPreview: (csvFilename: string, sessionId: string) => void;
}

interface UploadFileButtonProps {
  onTablesUpdate: (tables: Table[]) => void;
  onSessionUpdate: (sessionId: string) => void;
}

export default function FilesManager({ onPreview }: FilesManagerProps) {
  const [uploadedTables, setUploadedTables] = useState<Table[]>([]);
  const sessionId = useSessionFileStore((state) => state.sessionId);
  const setSessionId = useSessionFileStore((state) => state.setSessionId);

  const handleTablesUpdate = (tables: Table[]) => {
    setUploadedTables(tables);
  };

  // For finding if sessionid is set
  const handleSessionUpdate = (newSessionId: string) => {
    setSessionId(newSessionId);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between w-full">
        <h2 className="text-2xl font-bold text-primaryWhite">Files</h2>
        <div className="flex justify-content">
          <UploadFileButton
            onTablesUpdate={handleTablesUpdate}
            onSessionUpdate={setSessionId}
          />
          <FolderPlusButton />
          <PlayButton />
        </div>
      </div>
      <TableList
        tables={uploadedTables}
        sessionId={sessionId}
        onPreview={(csvFilename, sessionId) =>
          onPreview(csvFilename, sessionId)
        }
      />
    </div>
  );
}
