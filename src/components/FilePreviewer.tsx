import React from "react";
import { FilePreviewerProps } from "@/types/files";

export default function FilePreviewer({
  file,
  type,
  name,
  objectUrl,
}: FilePreviewerProps) {
  if (!file || !objectUrl) return null;

  if (type === "pdf") {
    return (
      <div className="h-full w-full bg-panelBlack rounded-lg overflow-hidden flex flex-col">
        <h3 className="p-3 bg-selectedBlack text-primaryWhite font-medium border-b">
          {name}
        </h3>
        <iframe src={objectUrl} className="w-full flex-1" title={name} />
      </div>
    );
  } else if (["png", "jpg", "jpeg"].includes(type || "")) {
    return (
      <div className="h-full w-full bg-panelBlack rounded-lg overflow-hidden flex flex-col">
        <h3 className="p-2 bg-selectedBlack text-primaryWhite font-medium border-b">
          {name}
        </h3>
        <div className="p-2 flex items-center justify-center bg-selectedBlack flex-1">
          <img
            src={objectUrl}
            alt={name}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-selectedBlack border-grey border rounded-lg overflow-hidden flex flex-col mb-2">
      <h3 className="bg-selectedBlack text-primaryWhite font-medium border-b pl-2">
        {name}
      </h3>
      <div className="p-2 flex items-center justify-center bg-selectedBlack flex-1">
        <p className="text-primaryWhite">
          Preview not available for this file type
        </p>
      </div>
    </div>
  );
}
