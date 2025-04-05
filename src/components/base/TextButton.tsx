import { TextButtonProps } from "@/types/files";

export default function TextButton({
  label,
  onClick,
  isActive,
}: TextButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded transition-colors duration-200 ${
        isActive ? "bg-blue-600 text-white" : "bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}
