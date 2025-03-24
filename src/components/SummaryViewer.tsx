"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SummaryViewerProps, AnalysisResponse } from "@/types/files";

interface SummaryViewerProps {
  sessionId: string;
  csvFilename: string | undefined;
  file: File | undefined;
  fileName: string | undefined;
}

interface AnalysisResponse {
  summary: string;
  keywords: string[];
  error?: string;
}

const fetchTableAnalysis = async ({
  queryKey,
}: {
  queryKey: any[];
}): Promise<AnalysisResponse> => {
  const [_key, sessionId, csvFilename] = queryKey;

  if (!sessionId || !csvFilename) {
    return { summary: "", keywords: [] };
  }

  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("csv_name", csvFilename);
  // Use default model (llama3)

  const response = await axios.post(
    "http://localhost:8000/api/analyze_table",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

const fetchImageAnalysis = async ({
  queryKey,
}: {
  queryKey: any[];
}): Promise<AnalysisResponse> => {
  const [_key, sessionId, fileName] = queryKey;

  if (!sessionId || !fileName) {
    return { summary: "", keywords: [] };
  }

  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("file_name", fileName);
  // Use default model (llama3)
  console.log(formData);
  console.log(sessionId);
  console.log(fileName);
  const response = await axios.post(
    "http://localhost:8000/api/analyze_image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

const fetchPDFAnalysis = async ({
  queryKey,
}: {
  queryKey: any[];
}): Promise<AnalysisResponse> => {
  const [_key, sessionId, fileName] = queryKey;
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("pdf_file_name", fileName);
  // Use default model (llava)
  console.log(formData);
  console.log(sessionId);
  console.log(fileName);
  const response = await axios.post(
    "http://localhost:8000/api/analyze_pdf",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export default function SummaryViewer({
  sessionId,
  csvFilename,
  file,
  fileName,
}: SummaryViewerProps) {
  const isImage = file && (
    file.type.startsWith('image/') || 
    ["png", "jpg", "jpeg", "gif"].some(ext => 
      file.name.toLowerCase().endsWith(`.${ext}`)
    )
  );
  const isPDF = file && file.type.startsWith('application/pdf');
  console.log(file);
  console.log(file?.type);
  console.log(isPDF);
  // Determine which analysis function to use based on the file type
  const { data, isLoading, isError, error } = useQuery({
    queryKey: isImage 
      ? ["imageAnalysis", sessionId, fileName] 
      : isPDF
      ? ["pdfAnalysis", sessionId, fileName]
      : ["tableAnalysis", sessionId, csvFilename],
    queryFn: isImage ? fetchImageAnalysis : isPDF ? fetchPDFAnalysis : fetchTableAnalysis,
    enabled: !!sessionId && (isImage ? !!file : isPDF ? !!file : !!csvFilename),
    refetchOnWindowFocus: false,
  });

  if (!csvFilename && !isImage && !isPDF) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg text-white">
        <h2 className="text-xl font-bold mb-4">Analysis</h2>
        <p className="text-gray-400">Select a file to view its analysis</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg text-white">
        <h2 className="text-xl font-bold mb-4">Analysis</h2>
        <p className="text-gray-400">Analyzing {isImage ? "image" : isPDF ? "pdf" : "table"} data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg text-white">
        <h2 className="text-xl font-bold mb-4">Analysis</h2>
        <p className="text-red-500">
          Error analyzing {isImage ? "image" : isPDF ? "pdf" : "table"}: {error?.toString()}
        </p>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg text-white">
        <h2 className="text-xl font-bold mb-4">Analysis</h2>
        <p className="text-red-500">Error: {data.error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg text-white w-[400px] overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">Analysis</h2>

      {/* Summary Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Summary</h3>
        <p className="text-gray-300">
          {data?.summary || "No summary available"}
        </p>
      </div>

      {/* Output Section (JSON-like display) */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Output</h3>
        <div className="bg-gray-900 p-3 rounded-md overflow-auto max-h-40">
          <pre className="text-gray-300 text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>

      {/* Keywords Section */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Keywords</h3>
        <div className="flex flex-wrap gap-2">
          {data?.keywords?.map((keyword: string, index: number) => (
            <div
              key={index}
              className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm flex items-center"
            >
              <span>{keyword}</span>
              <button className="ml-2 text-xs">×</button>
            </div>
          ))}
          {(!data?.keywords || data.keywords.length === 0) && (
            <p className="text-gray-400">No keywords available</p>
          )}
        </div>
      </div>
    </div>
  );
}
