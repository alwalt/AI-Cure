import { useState, useEffect } from "react";
import { EditableTextAreaProps } from "@/types/files";

export default function EditableTextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: EditableTextAreaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-2 border border-grey rounded-lg resize-none bg-primaryBlack text-primaryWhite placeholder-primaryWhite"
      rows={rows} // Set number of rows for the textarea
      style={{
        maxHeight: "400px",
        overflowY: "auto",
      }} // Make it scrollable if the content exceeds max height
    />
  );
}
