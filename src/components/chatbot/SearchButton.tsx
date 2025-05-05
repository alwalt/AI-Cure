import React, { useRef, useState } from "react";

interface SearchButtonProps {
  setState: any;
  actionProvider: any;
  messageParser: any;
}

const SearchButton: React.FC<SearchButtonProps> = ({ messageParser }) => {
  const searchRef = useRef<HTMLDivElement>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleSearchClick = () => {
    const newSearchState = !isSearchActive;
    setIsSearchActive(newSearchState);
    messageParser.setSearchMode(newSearchState);
    
    // Focus on the chat input after clicking search
    const inputElement = document.querySelector(".react-chatbot-kit-chat-input") as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
      inputElement.placeholder = newSearchState 
        ? "Enter your search query..." 
        : "Write a message...";
      
      if (newSearchState) {
        // Add event listener to reset search mode on Enter key
        inputElement.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            setIsSearchActive(false);
          }
        }, { once: true });
      }
    }
  };

  return (
    <div 
      ref={searchRef} 
      className={`search-button ${isSearchActive ? 'active' : ''}`}
      onClick={handleSearchClick}
      title={isSearchActive ? "Cancel search" : "Search biological database"}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </div>
  );
};

export default SearchButton; 