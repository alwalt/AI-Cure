"use client";
import { useRouter, usePathname } from "next/navigation";

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex bg-surface-navigation rounded-lg p-1 mb-4">
      <button
        onClick={() => handleNavigation("/")}
        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          pathname === "/"
            ? "bg-button-navigation text-text-emphasis"
            : "text-button-navigation hover:bg-button-hover-navigation hover:text-text-default"
        }`}
      >
        AI Curation
      </button>
      <button
        onClick={() => handleNavigation("/ai-training")}
        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          pathname === "/ai-training"
            ? "bg-button-navigation text-text-emphasis"
            : "text-button-navigation hover:bg-button-hover-navigation hover:text-text-default"
        }`}
      >
        AI Training
      </button>
    </div>
  );
}
