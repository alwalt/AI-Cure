"use client";
import { useState } from "react";

type FileItem = {
	id: string;
	name: string;
	type: string;
	createdAt: string;
	status: "Uploaded" | "Upload Failed";
};

const sampleFiles: FileItem[] = [
	{
		id: "1",
		name: "new placeHolder1.pdf",
		type: "PDF",
		createdAt: "2025-01-30",
		status: "Uploaded",
	},
	{
		id: "2",
		name: "placeHolder2.xlsx",
		type: "Excel",
		createdAt: "2025-01-28",
		status: "Upload Failed",
	},
	{
		id: "3",
		name: "placeHolder3.txt",
		type: "Text",
		createdAt: "2025-02-01",
		status: "Uploaded",
	},
];

export default function FileTable() {
	const [files, setFiles] = useState<FileItem[]>(sampleFiles);
	const [sortKey, setSortKey] = useState<keyof FileItem>("name");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
	const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

	const handleSort = (key: keyof FileItem) => {
		const order = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
		setSortKey(key);
		setSortOrder(order);

		setFiles(
			[...files].sort((a, b) => {
				const aValue = a[key].toString().toLowerCase();
				const bValue = b[key].toString().toLowerCase();
				return order === "asc"
					? aValue.localeCompare(bValue)
					: bValue.localeCompare(aValue);
			})
		);
	};

	const toggleSelection = (id: string) => {
		setSelectedFiles((prev) =>
			prev.includes(id) ? prev.filter((fileId) => fileId !== id) : [...prev, id]
		);
	};

	return (
		<section className="p-4 bg-gray-100 rounded-lg">
			<h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
			<table className="w-full bg-white border border-gray-300 rounded-lg shadow-sm">
				<thead>
					<tr className="bg-gray-200 text-left">
						<th className="p-2">
							<input
								type="checkbox"
								aria-label="Select all files"
								onChange={(e) => {
									setSelectedFiles(
										e.target.checked ? files.map((f) => f.id) : []
									);
								}}
								checked={selectedFiles.length === files.length}
							/>
						</th>
						{["name", "type", "createdAt", "status"].map((key) => (
							<th
								key={key}
								className="p-2 cursor-pointer hover:bg-gray-300"
								onClick={() => handleSort(key as keyof FileItem)}
								aria-sort={
									sortKey === key
										? sortOrder === "asc"
											? "ascending"
											: "descending"
										: "none"
								}
							>
								{key.charAt(0).toUpperCase() + key.slice(1)}
								{sortKey === key && (sortOrder === "asc" ? " ▲" : " ▼")}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{files.map((file) => (
						<tr key={file.id} className="border-t border-gray-300">
							<td className="p-2">
								<input
									type="checkbox"
									aria-label={`Select ${file.name}`}
									checked={selectedFiles.includes(file.id)}
									onChange={() => toggleSelection(file.id)}
								/>
							</td>
							<td className="p-2">{file.name}</td>
							<td className="p-2">{file.type}</td>
							<td className="p-2">{file.createdAt}</td>
							<td
								className={`p-2 font-semibold ${
									file.status === "Uploaded" ? "text-green-600" : "text-red-600"
								}`}
							>
								{file.status === "Uploaded"
									? "✅ Uploaded"
									: "❌ Upload Failed"}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</section>
	);
}
