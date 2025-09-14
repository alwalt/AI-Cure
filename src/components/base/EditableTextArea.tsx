// src/components/base/EditableTextArea.tsx
import { EditableTextAreaProps } from "@/types/files";

export default function EditableTextArea({
  sectionId,
  value,
  onChange,
  placeholder,
  rows = 4,
  className = "",
  disabled = false,
  maxHeight = "400px",
}: EditableTextAreaProps) {
  // Enhanced onChange that passes the sectionId for proper state management
  const handleChange = (newValue: string) => {
    onChange(sectionId, newValue);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Label for the text area */}
      <label htmlFor={`editable-textarea-${sectionId}`} className="sr-only">
        {placeholder} {/* You can change this to a more descriptive label */}
      </label>

      <textarea
        id={`editable-textarea-${sectionId}`} // Unique ID using sectionId
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full p-2 border border-grey rounded-lg resize-none bg-primaryBlack text-primaryWhite placeholder-primaryWhite ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        rows={rows} // Set number of rows for the textarea
        style={{
          maxHeight,
          overflowY: "auto",
        }} // Make it scrollable if the content exceeds max height
        aria-describedby={`editable-textarea-${sectionId}`} // Descriptive text (optional)
      />
    </div>
  );
}
