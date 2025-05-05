import React from 'react';

// Simple component with no external dependencies
const ButtonRow: React.FC = () => {
  const handleSearchClick = () => {
    // Set global flag for search mode
    window.nextMessageIsSearch = true;
    
    // Focus the input field
    const inputElement = document.querySelector(".react-chatbot-kit-chat-input") as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
      inputElement.placeholder = "Enter your search query...";
      
      // Reset after Enter key is pressed
      inputElement.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          setTimeout(() => {
            inputElement.placeholder = "Write a message...";
            window.nextMessageIsSearch = false;
          }, 100);
        }
      }, { once: true });
    }
  };
  
  return (
    <div className="button-row">
      <button className="tool-button" onClick={handleSearchClick}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span>Search</span>
      </button>
      
      <button className="tool-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
        <span>Deep research</span>
      </button>
      
      <button className="tool-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
        <span>Create image</span>
      </button>
      
      <button className="tool-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="19" cy="12" r="1"></circle>
          <circle cx="5" cy="12" r="1"></circle>
        </svg>
        <span>More</span>
      </button>
    </div>
  );
};

export default ButtonRow; 