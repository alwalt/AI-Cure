"use client";
import { useState, useRef } from "react";
import axios from "axios";
import {
  Table,
  UploadResponse,
  UploadedFile,
  FileUploaderProps,
} from "@/types/files";

export default function FileUploader({
  onTablesUpdate,
  onSessionUpdate,
  onFilesUpdate,
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  // const [sessionId, setSessionId] = useState<string>("");
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

    // Upload all files to the endpoint
    for (const file of files) {
      try {
        const formData = new FormData();
        const fileType = getFileType(file.name);
        formData.append("file", file);
        formData.append("file_type", fileType);

        const response = await axios.post<UploadResponse>(
          "http://localhost:8000/api/upload_file",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            timeout: 30000,
            withCredentials: true,
          }
        );
        // print out the response data decoded
        // console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
        // console.log(`Session ID: ${response.data.session_id}`);

        // setSessionId(response.data.session_id);
        // onSessionUpdate?.(response.data.session_id);
        // console.log(`Session ID: ${response.data.session_id}`);

        if (fileType == "excel" || fileType == "xlsx") {
          if (response.data.tables.length > 0) {
            setTables(response.data.tables);
            onTablesUpdate?.(response.data.tables);
          }
        }
        console.log(`Response: ${response.data}`);
        // console.log(`Session ID: ${sessionId}`);
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
      }
    }

    const uploadedFiles = files.map((file) => ({
      name: file.name,
      type: getFileType(file.name),
      dateCreated: new Date().toLocaleDateString(),
      size: file.size,
      file: file,
      selected: false,
    }));

    setUploadedFiles((prev) => [...prev, ...uploadedFiles]);
    onFilesUpdate?.(uploadedFiles);

    setUploadStatus("Files uploaded successfully!");
    setIsUploading(false);
  };

  const removeFile = (fileName: string) => {
    setFiles(files.filter((file) => file.name !== fileName));
    setUploadedFiles((prev) => prev.filter((file) => file.name !== fileName));
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

        <div className="space-y-4">
          <div className="text-primaryWhite font-medium">
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
              <h3 className="text-lg font-semibold text-primaryWhite mb-2">
                Selected Files:
              </h3>
              <div className="space-y-2">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-selectedBlack text-primaryWhite p-3 rounded-md shadow-sm border-grey border"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-primaryWhite">{file.name}</span>
                      <span className="text-sm text-primaryWhite">
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
