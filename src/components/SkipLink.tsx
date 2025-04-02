"use client";

export default function SkipLink({
  targetId,
  children,
}: {
  targetId: string;
  children: React.ReactNode;
}) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.tabIndex = -1;
      targetElement.focus();
    }
  };

  return (
    <a
      href={`#${targetId}`}
      className="fixed top-0 left-0 bg-white p-2 border border-black text-black text-sm sr-only focus:not-sr-only"
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
