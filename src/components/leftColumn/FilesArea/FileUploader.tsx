"use client";
import { useState, useRef } from "react";
import axios from "axios";
import {
  Table,
  UploadResponse,
  UploadedFile,
  FileUploaderProps,
  IngestResponse,
} from "@/types/files";
import { apiBase } from "@/lib/api";

export default function FileUploader({
  onTablesUpdate,
  onFilesUpdate,
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles] = useState<UploadedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

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
      const fileArray = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...fileArray]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
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

    const currentUploadedFiles: UploadedFile[] = [];
    const currentTables: Table[] = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        const fileType = getFileType(file.name);
        formData.append("file", file);
        formData.append("file_type", fileType);

        const response = await axios.post<UploadResponse>(
          `${apiBase}/api/upload_file`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            timeout: 30000,
            withCredentials: true,
          }
        );

        currentUploadedFiles.push({
          name: file.name,
          type: fileType,
          dateCreated: new Date().toLocaleDateString(),
          size: file.size,
          file: file,
          selected: false,
        });

        if (fileType === "xlsx" || fileType === "excel") {
          if (response.data.tables && response.data.tables.length > 0) {
            currentTables.push(...response.data.tables);
          }
        }
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        setUploadStatus(`Error uploading ${file.name}.`);
      }
    }

    if (currentUploadedFiles.length > 0) {
      onFilesUpdate?.(currentUploadedFiles);
    }
    if (currentTables.length > 0) {
      onTablesUpdate?.(currentTables);
    }

    setFiles([]);
    setUploadStatus(
      currentUploadedFiles.length > 0
        ? "File(s) uploaded successfully!"
        : "Upload process completed."
    );
    setIsUploading(false);
  };

  const removeFile = (fileName: string) => {
    setFiles(files.filter((file) => file.name !== fileName));
    onFilesUpdate?.(uploadedFiles.filter((file) => file.name !== fileName));
  };

  return (
    <section className="p-4 bg-selectedBlack rounded-lg">
      <div
        className={`relative p-8 ${
          dragActive ? "bg-gray-300" : "bg-unSelectedBlack"
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

        <div className="space-y-4 last:mb-0">
          <div className="text-primaryWhite font-medium">
            <p>Drag and drop your files here, or</p>
            <button
              onClick={() => inputRef.current?.click()}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={isUploading}
            >
              Browse Files
            </button>
          </div>

          {uploadStatus && (
            <div className="mt-2 text-gray-400 font-medium">{uploadStatus}</div>
          )}

          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-primaryWhite mb-2">
                Selected Files:
              </h3>
              <div className="space-y-2 last:mb-0">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-selectedBlack text-primaryWhite p-3 rounded-md shadow-sm border-grey border"
                  >
                    <div className="flex items-center space-x-2 last:mb-0">
                      <span className="text-primaryWhite max-w-[180px] overflow-x-auto whitespace-nowrap">
                        {file.name}
                      </span>
                      <span className="text-sm text-primaryWhite">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(file.name)}
                      className="text-red-500 hover:text-red-700"
                      disabled={isUploading}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-x-4 last:mb-0">
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
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
