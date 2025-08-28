"use client";
import { useRouter, usePathname } from "next/navigation";

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex bg-surface-emphasis border-2 border-border-column rounded-lg p-1">
      <button
        onClick={() => handleNavigation("/")}
        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
          pathname === "/"
            ? "bg-button-card text-text-default underline"
            : "text-button-navigation hover:bg-button-hover-card hover:text-text-default hover:font-bold"
        }`}
      >
        AI Curation
      </button>
      <button
        onClick={() => handleNavigation("/ai-training")}
        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
          pathname === "/ai-training"
            ? "bg-button-navigation text-text-default underline"
            : "text-button-card hover:bg-button-hover-card hover:text-text-default hover:font-bold"
        }`}
      >
        AI Training
      </button>
    </div>
  );
}
