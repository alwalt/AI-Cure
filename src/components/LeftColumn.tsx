import FilesManager from "./FilesManager";

interface LeftColumnProps {
	onPreview: (csvFilename: string, sessionId: string) => void;
}

export default function LeftColumn({ onPreview }: LeftColumnProps) {
	return (
		<div className="bg-primaryBlack p-4 h-full">
			<FilesManager onPreview={onPreview} />
		</div>
	);
}
