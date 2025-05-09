import React, { useState, useEffect } from 'react';

const SearchButton: React.FC = () => {
  const [isActive, setIsActive] = useState(false);

  // On component mount, check if there's already a parser instance
  useEffect(() => {
    console.log('SearchButton mounted, checking for MessageParser instance');
    const parser = (window as any).messageParserInstance;
    if (parser) {
      console.log('Found existing MessageParser instance');
    } else {
      console.error('No MessageParser instance found on mount - this is a problem!');
    }
  }, []);

  const handleClick = () => {
    console.log('Search button clicked');
    // Toggle search mode on the MessageParser instance
    const parser = (window as any).messageParserInstance;
    const newActive = !isActive;
    
    console.log('Search button: setting isActive to', newActive);
    setIsActive(newActive);
    
    if (parser && typeof parser.setSearchMode === 'function') {
      console.log('Found MessageParser instance, calling setSearchMode with:', newActive);
      parser.setSearchMode(newActive);
    } else {
      console.error('MessageParser instance not found or missing setSearchMode method');
      // Try to find it again after a short delay (React rendering might delay it)
      setTimeout(() => {
        const delayedParser = (window as any).messageParserInstance;
        if (delayedParser && typeof delayedParser.setSearchMode === 'function') {
          console.log('Found MessageParser instance after delay, calling setSearchMode with:', newActive);
          delayedParser.setSearchMode(newActive);
        } else {
          console.error('Still cannot find MessageParser instance after delay!');
        }
      }, 100);
    }

    // Focus and update placeholder on the input field
    const inputElement = document.querySelector('.react-chatbot-kit-chat-input') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
      inputElement.placeholder = newActive ? 'Enter your search query...' : 'Write a message...';
      console.log('Updated input placeholder to:', inputElement.placeholder);
    } else {
      console.error('Could not find chat input element');
    }
  };

  return (
    <>
      {/* <button 
        onClick={() => (window as any).messageParserInstance?.setSearchMode(true)}
        style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000 }}
      >
        FORCE SEARCH MODE
      </button> */}

      <button
        onClick={handleClick}
        className={`search-button ${isActive ? 'active' : ''}`}
        title={isActive ? 'Disable OSDR search mode' : 'Enable OSDR search mode'}
        data-search-active={isActive.toString()}
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
        <span>OSDR Search {isActive ? '(On)' : '(Off)'}</span>
      </button>
    </>
  );
};

export default SearchButton; 