"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { apiBase } from "@/lib/api";
import { useDataSets, DataSet } from "@/store/useDataSets";

export default function TrainingDataSetUploader() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const addDataSets = useDataSets((state) => state.addDataSets);

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
      case "json":
        return "json";
      case "jsonl":
        return "jsonl";
      case "txt":
        return "txt";
      case "tsv":
        return "tsv";
      case "parquet":
        return "parquet";
      case "hdf5":
      case "h5":
        return "hdf5";
      case "sql":
        return "sql";
      case "xml":
        return "xml";
      default:
        return extension;
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadStatus("Please select dataset files first");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading datasets...");

    const currentUploadedDataSets: DataSet[] = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        const fileType = getFileType(file.name);
        formData.append("file", file);
        formData.append("file_type", fileType);

        console.log(
          `Uploading dataset: ${
            file.name
          }, type: ${fileType}, extension: ${file.name
            .split(".")
            .pop()
            ?.toLowerCase()}`
        );

        const response = await axios.post(
          `${apiBase}/api/upload_training_dataset`, // Updated endpoint name
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            timeout: 60000, // Longer timeout for potentially large datasets
            withCredentials: true,
          }
        );

        currentUploadedDataSets.push({
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          type: fileType,
          dateCreated: new Date().toLocaleDateString(),
          size: file.size,
          file: file,
          selected: false,
        });
      } catch (error) {
        console.error(`Error uploading dataset ${file.name}:`, error);
        if (axios.isAxiosError(error)) {
          console.error("Response data:", error.response?.data);
          console.error("Response status:", error.response?.status);
        }
        setUploadStatus(`Error uploading ${file.name}.`);
      }
    }

    if (currentUploadedDataSets.length > 0) {
      addDataSets(currentUploadedDataSets);
    }

    setFiles([]);
    setUploadStatus(
      currentUploadedDataSets.length > 0
        ? "Dataset(s) uploaded successfully!"
        : "Upload process completed."
    );
    setIsUploading(false);
  };

  const removeFile = (fileName: string) => {
    setFiles(files.filter((file) => file.name !== fileName));
  };

  useEffect(() => {
    console.log("📊 TrainingDataSetUploader files state:", files);
  }, [files]);

  return (
    <section className="p-4 bg-surface-contrast rounded-lg">
      <div
        className={`relative p-8 ${
          dragActive ? "bg-gray-700" : "bg-gray-850"
        } border-2 border-dashed border-border-accent rounded-lg text-center transition-colors`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.json,.jsonl,.txt,.tsv,.parquet,.h5,.hdf5,.sql,.xml"
          onChange={handleChange}
          multiple
          data-cy="dataset-input"
          className="hidden"
        />

        <div className="space-y-4 last:mb-0">
          <div className="text-text-default font-medium">
            <p>Drag and drop your training datasets here, or</p>
            <button
              onClick={() => inputRef.current?.click()}
              className="mt-2 px-4 py-2 bg-surface-navigation text-button-navigation rounded-md hover:bg-button-hover-navigation transition-colors"
              disabled={isUploading}
            >
              Browse Datasets
            </button>
          </div>

          {uploadStatus && (
            <div className="mt-2 text-gray-400 font-medium">{uploadStatus}</div>
          )}

          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-text-default mb-2">
                Selected Datasets:
              </h3>
              <div className="space-y-2 last:mb-0">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-surface-file-area text-text-default p-3 rounded-md shadow-sm border border-border-file-area"
                  >
                    <div className="flex items-center space-x-2 last:mb-0">
                      <span className="text-text-default max-w-[180px] overflow-x-auto whitespace-nowrap">
                        {file.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(file.name)}
                      className="text-red-600 hover:text-red-700 transition-colors"
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
                  className="px-6 py-2 bg-surface-navigation text-button-navigation rounded-md hover:bg-button-hover-navigation transition-colors disabled:bg-button-emphasis disabled:text-gray-500"
                  data-cy="dataset-upload-submit"
                >
                  {isUploading ? "Uploading..." : "Upload Datasets"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
