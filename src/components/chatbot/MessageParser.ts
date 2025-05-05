class MessageParser {
  actionProvider: any;
  isSearchMode: boolean;

  constructor(actionProvider: any) {
    this.actionProvider = actionProvider;
    this.isSearchMode = true;
    // Expose this parser instance globally for search button
    (window as any).messageParserInstance = this;
    console.log('MessageParser constructor called, parser exposed as window.messageParserInstance');
  }

  parse(message: string) {
    console.log('Current parser instance:', this);
    console.log('Stored search mode:', this.isSearchMode);
    if (message.trim()) {
      console.log('Parsing message:', message);
      console.log('Current search mode:', this.isSearchMode);
      
      // Explicitly check search mode and log the decision path
      if (this.isSearchMode === true) {
        console.log('SEARCH MODE: Using handleSearchQuery with endpoint /api/mcp_query');
        this.actionProvider.handleSearchQuery(message);
      } else {
        console.log('NORMAL MODE: Using handleUserMessage with endpoint /api/get_chat_response');
        this.actionProvider.handleUserMessage(message);
      }
    }
  }

  setSearchMode(isSearch: boolean) {
    console.log('MessageParser.setSearchMode called with:', isSearch);
    this.isSearchMode = isSearch;
    
    // Log the current value to verify it was set
    console.log('MessageParser.isSearchMode is now:', this.isSearchMode);
    
    // Update input placeholder for better UX
    const inputElement = document.querySelector('.react-chatbot-kit-chat-input') as HTMLInputElement;
    if (inputElement) {
      inputElement.placeholder = isSearch ? 'Enter your search query...' : 'Write a message...';
      // Set dataset attribute for styling if needed
      inputElement.dataset.searchMode = isSearch ? "true" : "false";
      console.log('Input placeholder updated to:', inputElement.placeholder);
    } else {
      console.error('Could not find chat input element');
    }
  }
}

export default MessageParser;
