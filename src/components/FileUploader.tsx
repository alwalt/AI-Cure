"use client";
import { useState, useRef } from "react";
import axios from "axios";
import { Table, UploadResponse, UploadedFile } from "@/types/files";

interface FileUploaderProps {
  onTablesUpdate?: (tables: Table[]) => void;
  onSessionUpdate?: (sessionId: string) => void;
  onFilesUpdate?: (files: UploadedFile[]) => void;
}

export default function FileUploader({
  onTablesUpdate,
  onSessionUpdate,
  onFilesUpdate,
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [tables, setTables] = useState<Table[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Handle multiple files
      const fileArray = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...fileArray]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      // Handle multiple files
      const fileArray = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...fileArray]);
    }
  };

  const getFileType = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    switch (extension) {
      case "xlsx":
      case "xls":
        return "xlsx";
      case "csv":
        return "csv";
      case "pdf":
        return "pdf";
      case "png":
      case "jpg":
      case "jpeg":
        return "png";
      default:
        return extension;
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadStatus("Please select files first");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading files...");

    // Separate Excel/CSV files from other types
    const excelFiles = files.filter((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      return ext === "xlsx" || ext === "xls" || ext === "csv";
    });

    // Add non-Excel files directly to uploadedFiles
    const nonExcelFiles = files.filter((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      return ext !== "xlsx" && ext !== "xls" && ext !== "csv";
    });

    // Create UploadedFile objects for non-Excel files
    const newNonExcelUploadedFiles = nonExcelFiles.map((file) => ({
      name: file.name,
      type: getFileType(file.name),
      dateCreated: new Date().toLocaleDateString(),
      size: file.size,
      file: file,
      selected: false,
    }));

    // Add non-Excel files to state
    setUploadedFiles((prev) => [...prev, ...newNonExcelUploadedFiles]);

    // Only process Excel files with the API
    if (excelFiles.length > 0) {
      try {
        const formData = new FormData();
        // Add each Excel file
        for (const file of excelFiles) {
          formData.append("file", file);
        }

        const response = await axios.post<UploadResponse>(
          "http://localhost:8000/api/upload_excel",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            timeout: 30000,
          }
        );

        setSessionId(response.data.session_id);
        setTables(response.data.tables);
        onTablesUpdate?.(response.data.tables);
        onSessionUpdate?.(response.data.session_id);

        // Create UploadedFile objects for Excel files
        const newExcelUploadedFiles = excelFiles.map((file) => ({
          name: file.name,
          type: getFileType(file.name),
          dateCreated: new Date().toLocaleDateString(),
          size: file.size,
          file: file,
          selected: false,
        }));

        // Combine all uploaded files
        const allNewFiles = [
          ...newExcelUploadedFiles,
          ...newNonExcelUploadedFiles,
        ];
        setUploadedFiles((prev) => [...prev, ...allNewFiles]);
        onFilesUpdate?.(allNewFiles);

        setUploadStatus("Files uploaded successfully!");
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setUploadStatus(
            `Upload failed: ${error.response?.data?.error || error.message}`
          );
        } else {
          setUploadStatus("Upload failed: Unknown error occurred");
        }
        console.error("Upload error:", error);
      }
    } else {
      // Only non-Excel files were uploaded
      onFilesUpdate?.(newNonExcelUploadedFiles);
      setUploadStatus("Files added successfully!");
    }

    setIsUploading(false);
  };

  const removeFile = (fileName: string) => {
    setFiles(files.filter((file) => file.name !== fileName));
    setUploadedFiles((prev) => prev.filter((file) => file.name !== fileName));
    onFilesUpdate?.(uploadedFiles.filter((file) => file.name !== fileName));
  };

  return (
    <section className="p-4 bg-gray-200 rounded-lg">
      <div
        className={`relative p-8 ${
          dragActive ? "bg-gray-300" : "bg-gray-100"
        } border-2 border-dashed border-gray-400 rounded-lg text-center transition-colors`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.pdf,.png,.jpg,.jpeg"
          onChange={handleChange}
          multiple
          className="hidden"
        />

        <div className="space-y-4">
          <div className="text-gray-700 font-medium">
            <p>Drag and drop your files here, or</p>
            <button
              onClick={() => inputRef.current?.click()}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={isUploading || isExtracting}
            >
              Browse Files
            </button>
          </div>

          {uploadStatus && (
            <div className="mt-2 text-gray-700 font-medium">{uploadStatus}</div>
          )}

          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Selected Files:
              </h3>
              <div className="space-y-2">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-700">{file.name}</span>
                      <span className="text-sm text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(file.name)}
                      className="text-red-500 hover:text-red-700"
                      disabled={isUploading || isExtracting}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-x-4">
                <button
                  onClick={handleUpload}
                  disabled={isUploading || isExtracting}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
                >
                  {isUploading ? "Uploading..." : "Upload Files"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
