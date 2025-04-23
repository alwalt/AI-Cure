import { EditableTextAreaProps } from "@/types/files";

export default function EditableTextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: EditableTextAreaProps) {
  return (
    <div className="relative">
      {/* Label for the text area */}
      <label htmlFor="editable-textarea" className="sr-only">
        {placeholder} {/* You can change this to a more descriptive label */}
      </label>

      <textarea
        id="editable-textarea" // Add an ID to the text area for label association
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2 border border-grey rounded-lg resize-none bg-primaryBlack text-primaryWhite placeholder-primaryWhite"
        rows={rows} // Set number of rows for the textarea
        style={{
          maxHeight: "400px",
          overflowY: "auto",
        }} // Make it scrollable if the content exceeds max height
        aria-describedby="editable-textarea" // Descriptive text (optional)
      />
    </div>
  );
}
