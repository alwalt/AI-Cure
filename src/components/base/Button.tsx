import { ButtonProps } from "@/types/files";

export default function Button({
  buttonDescription,
  onClick,
  Icon,
  iconClassName = "",
  spanClassName = "",
  role = "button", // Default role if not provided
  "aria-label": ariaLabel,
}: ButtonProps) {
  const handleClick = async () => {
    if (onClick) await onClick();
  };

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        className="flex"
        aria-label={ariaLabel || buttonDescription}
        role={role}
      >
        <Icon
          className={`focus-visible:ring-2 focus-visible:ring-white stroke-primaryWhite stroke-1 text-primaryBlack hover:stroke-redFill transition-colors duration-300 ${iconClassName}`}
        />
      </button>

      {/* Tooltip */}
      <span
        className={`absolute top-full mt-1 whitespace-nowrap rounded bg-primaryBlack border-primaryWhite border text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 px-2 py-1 z-10 ${spanClassName}`}
      >
        {buttonDescription}
      </span>
    </div>
  );
}
