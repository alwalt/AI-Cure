import { TextButtonProps } from "@/types/files";

export default function TextButton({
  label,
  buttonDescription = "",
  onClick,
  isActive,
  buttonClassName = "",
  spanClassName = "",
}: TextButtonProps) {
  return (
    <div className="relative group flex flex-col items-center overflow-hidden">
      <button
        onClick={onClick}
        className={`px-2 rounded-none border-none focus-visible:ring-2 focus-visible:!ring-primaryWhite focus-visible:ring-offset-2 transition-all duration-300
        ${
          isActive
            ? "font-bold text-lg text-primaryWhite underline"
            : "font-normal text-brightGrey text-sm hover:underline hover:text-base hover:text-selectedBlue"
        } 
        ${buttonClassName}`}
      >
        {label}
      </button>

      <span
        className={`absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-primaryBlack border-primaryWhite border text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 px-2 py-1 ${spanClassName}`}
      >
        {buttonDescription}
      </span>
    </div>
  );
}
