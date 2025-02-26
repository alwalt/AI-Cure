import TablePreviewer from "./TableViewer";

interface MiddleTopColumnProps {
	sessionId: string;
	previewCsv?: string;
}

export default function MiddleTopColumn({
	sessionId,
	previewCsv,
}: MiddleTopColumnProps) {
	return (
		<div className="border-red-50 border-2 bg-primaryBlack p-4 flex justify-between items-center h-full">
			<p>Middle Top Column</p>
			{previewCsv && (
				<TablePreviewer sessionId={sessionId} csvFilename={previewCsv} />
			)}
		</div>
	);
}
