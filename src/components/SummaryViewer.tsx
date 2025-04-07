"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SummaryViewerProps, AnalysisResponse } from "@/types/files";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";


const fetchTableAnalysis = async ({
  queryKey,
}: {
  queryKey: any[];
}): Promise<AnalysisResponse> => {
  const [_key, csvFilename] = queryKey;

  if (!csvFilename) {
    return { summary: "", keywords: [] };
  }

  const formData = new FormData();
  // formData.append("session_id", sessionId);
  formData.append("csv_name", csvFilename);
  // Use default model (llama3)

  const response = await axios.post(
    "http://localhost:8000/api/analyze_table",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    }
  );

  return response.data;
};

const fetchImageAnalysis = async ({
  queryKey,
}: {
  queryKey: any[];
}): Promise<AnalysisResponse> => {
  const [_key, fileName] = queryKey;

  if (!fileName) {
    return { summary: "", keywords: [] };
  }

  const formData = new FormData();
  formData.append("file_name", fileName);
  // Use default model (llama3)
  console.log(formData);
  console.log(fileName);
  const response = await axios.post(
    "http://localhost:8000/api/analyze_image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    }
  );

  return response.data;
};

const fetchPDFAnalysis = async ({
  queryKey,
}: {
  queryKey: any[];
}): Promise<AnalysisResponse> => {
  const [_key, fileName] = queryKey;
  const formData = new FormData();
  formData.append("pdf_file_name", fileName);
  // Use default model (llava)
  console.log(formData);
  console.log(fileName);
  const response = await axios.post(
    "http://localhost:8000/api/analyze_pdf",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    }
  );

  return response.data;
};

export default function SummaryViewer({
  // sessionId,
  csvFilename,
  file,
  fileName,
}: SummaryViewerProps) {
  const isImage =
    file &&
    (file.type.startsWith("image/") ||
      ["png", "jpg", "jpeg", "gif"].some((ext) =>
        file.name.toLowerCase().endsWith(`.${ext}`)
      ));
  const isPDF = file && file.type.startsWith("application/pdf");
  console.log(file);
  console.log(file?.type);
  console.log(isPDF);
  // Determine which analysis function to use based on the file type
  const { data, isLoading, isError, error } = useQuery({
    queryKey: isImage
      ? ["imageAnalysis", fileName]
      : isPDF
      ? ["pdfAnalysis", fileName]
      : ["tableAnalysis", csvFilename],
    queryFn: isImage
      ? fetchImageAnalysis
      : isPDF
      ? fetchPDFAnalysis
      : fetchTableAnalysis,
    enabled: isImage ? !!file : isPDF ? !!file : !!csvFilename,
    refetchOnWindowFocus: false,
  });

  const handleDownload = () => {
    console.log("CLICKED")
    // COnver data to JSON String
    const jsonData = JSON.stringify(data, null, 2);
    // create blob (file object)
    const blob = new Blob([jsonData], { type: 'application/json' });
    // Temp url for the file
    const url = window.URL.createObjectURL(blob);
    // Hidden link element
    const link = document.createElement('a');
    link.href = url;
    link.download = `${new Date().toISOString()}_file_analysis.json`;
    
    // Trigger download of object
    document.body.appendChild(link);
    link.click();
    // clean up the download url
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  if (!csvFilename && !isImage && !isPDF) {
    return (
      <div className="p-2 bg-unSelectedBlack border-grey border rounded-lg text-white">
        <h2 className="text-xl font-bold mb-4">Analysis</h2>
        <p className="text-gray-400">Select a file to view its analysis</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-2 bg-unSelectedBlack border-grey border rounded-lg text-white">
        <h2 className="text-xl font-bold mb-4">Analysis</h2>
        <p className="text-gray-400">
          Analyzing {isImage ? "image" : isPDF ? "pdf" : "table"} data...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-2 bg-unSelectedBlack border-grey border rounded-lg text-white">
        <h2 className="text-xl font-bold mb-4">Analysis</h2>
        <p className="text-red-500">
          Error analyzing {isImage ? "image" : isPDF ? "pdf" : "table"}:{" "}
          {error?.toString()}
        </p>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="p-2 bg-unSelectedBlack border-grey border rounded-lg text-white">
        <h2 className="text-xl font-bold mb-4">Analysis</h2>
        <p className="text-red-500">Error: {data.error}</p>
      </div>
    );
  }

  return (
    <div className="p-2 bg-unSelectedBlack border-grey border rounded-lg text-white w-[400px] overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">Analysis</h2>

      {/* Summary Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Summary</h3>
        <p className="text-gray-300">
          {data?.summary || "No summary available"}
        </p>
      </div>

      {/* Output Section (JSON-like display) */}
      <div className="mb-6 relative">
      <button
          onClick={handleDownload}
          className="absolute top-2 right-2 p-1 hover:bg-gray-800 rounded-md"
          aria-label="Download JSON"
        >
          <ArrowDownTrayIcon className="h-4 w-4 text-gray-400" />
        </button>
        <h3 className="text-lg font-semibold mb-2">Output</h3>
        <div className="bg-gray-900 p-3 rounded-md overflow-auto max-h-40 relative">
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