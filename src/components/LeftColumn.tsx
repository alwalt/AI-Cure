import FilesManager from "./FilesManager";
import FileUploader from "./FileUploader";

interface LeftColumnProps {
	onPreview: (csvFilename: string, sessionId: string) => void;
}

export default function LeftColumn({ onPreview }: LeftColumnProps) {
	return (
		<div className="bg-blue-500 p-4 h-full">
			<FilesManager onPreview={onPreview} />
		</div>
	);
}
