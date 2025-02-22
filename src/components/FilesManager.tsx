import { useState } from "react";
// import FilesTable from "./FilesTable";
// import FileUploader from "./FileUploader"; // This is in UploadFileButton
import TableList from "./TableList";
import UploadFileButton from "@/components/base/UploadFileButton";

// Defining table type based on the response from the API.
interface Table {
	csv_filename: string;
	display_name: string;
}

// Defining properties for file manager comp
interface FilesManagerProps {
	onPreview: (csvFilename: string, sessionId: string) => void; // These are sent to the preview api call.
}

// Defining the file manager component, uses onpreview from parent.
export default function FilesManager({ onPreview }: FilesManagerProps) {
	// Using useState we store the uploaded tables and the session id.
	const [uploadedTables, setUploadedTables] = useState<Table[]>([]);
	const [sessionId, setSessionId] = useState<string>("");

	// This function updates the uploaded tables after api call.
	const handleTablesUpdate = (tables: Table[]) => {
		setUploadedTables(tables);
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-content">
				<h2 className="text-2xl font-bold text-primaryWhite">Files</h2>
				<UploadFileButton />
			</div>
			{/* File uploader component, updates the uploaded tables and the session id. */}
			{/* <FileUploader
				onTablesUpdate={handleTablesUpdate}
				onSessionUpdate={setSessionId}
			/> */}
			{/* Table list component, displays the uploaded tables and allows preview button. */}
			<TableList
				tables={uploadedTables}
				sessionId={sessionId}
				onPreview={(csvFilename, sessionId) =>
					onPreview(csvFilename, sessionId)
				}
			/>
			{/* Files table component, displays the uploaded tables.
			<FilesTable /> */}
		</div>
	);
}
