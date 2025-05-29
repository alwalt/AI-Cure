import { useChatbotStore } from "@/store/useChatbotStore";
import React from "react";
const SearchButton: React.FC = () => {
  const isSearchMode = useChatbotStore((s) => s.isSearchMode);
  const setSearchMode = useChatbotStore((s) => s.setSearchMode);

  const handleClick = () => {
    const newMode = !isSearchMode;
    setSearchMode(newMode);

    const input = document.querySelector(
      ".react-chatbot-kit-chat-input"
    ) as HTMLInputElement | null;
    if (input)
      input.placeholder = newMode
        ? "Enter your search query…"
        : "Write a message…";
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`search-button ${isSearchMode ? "active" : ""}`}
        title={
          isSearchMode ? "Disable OSDR search mode" : "Enable OSDR search mode"
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span>OSDR Search {isSearchMode ? "(On)" : "(Off)"}</span>
      </button>
    </>
  );
};

export default SearchButton;
