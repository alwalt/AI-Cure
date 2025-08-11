import Button from "./Button";
import { Settings } from "lucide-react";
import { SettingsButtonProps } from "@/types/files";

export default function SettingsButton({
  onClick,
  tooltipId = "settings-tooltip",
  ariaLabel = "Settings",
  iconClassName = "",
  spanClassName = "left-1/2 -translate-x-1/2 mt-2",
  className = "",
  strokeWidth = 1,
}: SettingsButtonProps) {
  // Create a custom icon component with the strokeWidth applied
  const CustomSettingsIcon = (props: any) => (
    <Settings {...props} strokeWidth={strokeWidth} />
  );
  return (
    <Button
      targetId="SettingsButton"
      onClick={onClick}
      Icon={CustomSettingsIcon}
      buttonDescription="Settings"
      iconClassName={iconClassName}
      spanClassName={spanClassName}
      tooltipId={tooltipId}
      aria-label={ariaLabel}
      className={`focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${className}`}
    />
  );
}
