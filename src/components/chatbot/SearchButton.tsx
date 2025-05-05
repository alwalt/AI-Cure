import React from 'react';

const SearchButton: React.FC = () => {
  const handleClick = () => {
    // Activate search mode on the MessageParser instance
    const parser = (window as any).messageParserInstance;
    if (parser && typeof parser.setSearchMode === 'function') {
      parser.setSearchMode(true);
    }
    
    // Focus and update placeholder on the input field
    const inputElement = document.querySelector('.react-chatbot-kit-chat-input') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
      inputElement.placeholder = 'Enter your search query...';
      
      // Reset placeholder and search mode when user submits
      inputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          if (parser && typeof parser.setSearchMode === 'function') {
            parser.setSearchMode(false);
          }
          inputElement.placeholder = 'Write a message...';
        }
      }, { once: true });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="search-button"
      title="Search mode"
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
      <span>Search</span>
    </button>
  );
};

export default SearchButton; 