"use client";
import { useState, useEffect } from "react";
import { UploadedFile } from "@/types/files";

interface FilePreviewProps {
  file: UploadedFile | null;
  onClose: () => void;
}

export default function FilePreview({ file, onClose }: FilePreviewProps) {
  const [objectUrl, setObjectUrl] = useState<string>("");

  useEffect(() => {
    if (file?.file) {
      // Create a blob URL for the file
      const url = URL.createObjectURL(file.file);
      setObjectUrl(url);
      
      // Clean up the URL when component unmounts
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  if (!file) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">{file.name}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-auto">
          {file.type === 'pdf' ? (
            <iframe 
              src={objectUrl} 
              className="w-full h-[70vh]" 
              title={file.name}
            />
          ) : file.type === 'png' || file.type === 'jpg' || file.type === 'jpeg' ? (
            <div className="flex items-center justify-center h-[70vh]">
              <img 
                src={objectUrl} 
                alt={file.name} 
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-[70vh] bg-gray-100">
              <p className="text-gray-500">Preview not available for this file type</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}