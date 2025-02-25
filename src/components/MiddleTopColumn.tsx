import TablePreviewer from "./TableViewer";
import { useState } from "react";

interface MiddleTopColumnProps {
	sessionId: string;
	previewCsv?: string;
}

export default function MiddleTopColumn({ sessionId, previewCsv }: MiddleTopColumnProps) {
	return (
		<div className="bg-green-500 p-4 flex justify-between items-center h-full">
			<p>Middle Top Column</p>
			{previewCsv && <TablePreviewer sessionId={sessionId} csvFilename={previewCsv} />}
		</div>
	);
}
