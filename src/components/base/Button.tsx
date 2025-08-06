import { ButtonProps } from "@/types/files";

export default function Button({
  buttonDescription,
  onClick,
  Icon,
  iconClassName = "",
  spanClassName = "",
  "aria-label": ariaLabel,
  tooltipId,
  className = "",
}: ButtonProps) {
  const handleClick = async () => {
    if (onClick) await onClick();
  };

  return (
    <div className="relative group">
      <div
        className={`focus-within:outline-none focus-within:ring-2 focus-within:ring-white rounded ${className}`}
      >
        <button
          onClick={handleClick}
          className="flex focus:outline-none"
          aria-label={ariaLabel || buttonDescription}
        >
          <Icon className={iconClassName} />
        </button>
      </div>
      {/* Tooltip */}
      <span
        id={tooltipId}
        role="tooltip"
        className={`absolute top-full mt-1 whitespace-nowrap rounded bg-primaryBlack border-primaryWhite border text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 px-2 py-1 z-10 ${spanClassName}`}
      >
        {buttonDescription}
      </span>
    </div>
  );
}
