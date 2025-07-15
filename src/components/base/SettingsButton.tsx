import Button from "./Button";
import { Settings } from "lucide-react";
import { SettingsButtonProps } from "@/types/files";

export default function SettingsButton({
  onClick,
  tooltipId = "settings-tooltip",
  ariaLabel = "Settings",
  iconClassName = "w-5 h-5",
  spanClassName = "left-1/2 -translate-x-1/2 mt-2",
}: SettingsButtonProps) {
  return (
    <Button
      targetId="SettingsButton"
      onClick={onClick}
      Icon={Settings}
      buttonDescription="Settings"
      iconClassName={iconClassName}
      spanClassName={spanClassName}
      tooltipId={tooltipId}
      aria-label={ariaLabel}
      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
    />
  );
}
