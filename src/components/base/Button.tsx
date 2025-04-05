import { ButtonProps } from "@/types/files";

export default function Button({
  targetId,
  buttonDescription,
  onClick,
  Icon,
  iconClassName = "",
}: ButtonProps) {
  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <div className="relative group">
      <button onClick={handleClick} className="flex">
        <Icon
          className={`h-8 w-8 stroke-primaryWhite stroke-1 text-primaryBlack hover:stroke-redFill transition-colors duration-300 ${iconClassName}`}
        />
      </button>

      {/* Tooltip */}
      <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-primaryBlack border-primaryWhite border text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 px-2 py-1">
        {buttonDescription}
      </span>
    </div>
  );
}
