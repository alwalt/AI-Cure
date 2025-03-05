"use client";
import { useState, useRef } from "react";
import axios from "axios";

// Table interface shared by FileUploader and FilesManager
interface Table {
  csv_filename: string;
  display_name: string;
}

interface UploadResponse {
  session_id: string;
  tables: Table[];
}

interface FileUploaderProps {
  onTablesUpdate?: (tables: Table[]) => void;
  onSessionUpdate?: (sessionId: string) => void;
}

export default function FileUploader({
  onTablesUpdate,
  onSessionUpdate,
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Only take the first file
      setFiles([e.dataTransfer.files[0]]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      // Only take the first file
      setFiles([e.target.files[0]]);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadStatus("Please select a file first");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading file...");

    const formData = new FormData();
    formData.append("file", files[0]);

    try {
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
      setUploadStatus("File uploaded successfully!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setUploadStatus(
          `Upload failed: ${error.response?.data?.error || error.message}`
        );
      } else {
        setUploadStatus("Upload failed: Unknown error occurred");
      }
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (fileName: string) => {
    setFiles(files.filter((file) => file.name !== fileName));
    setSessionId("");
    setTables([]);
    setUploadStatus("");
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
          accept=".xlsx,.xls,.csv"
          onChange={handleChange}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="text-gray-700 font-medium">
            <p>Drag and drop your Excel file here, or</p>
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
                Selected File:
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
                  {isUploading ? "Uploading..." : "Upload File"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
