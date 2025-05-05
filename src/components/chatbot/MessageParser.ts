class MessageParser {
  actionProvider: any;
  isSearchMode: boolean;

  constructor(actionProvider: any) {
    this.actionProvider = actionProvider;
    this.isSearchMode = false;
    // Expose this parser instance globally for search button
    (window as any).messageParserInstance = this;
  }

  parse(message: string) {
    if (message.trim()) {
      // Check if search mode is active by looking at the input element
      const inputElement = document.querySelector('.react-chatbot-kit-chat-input') as HTMLInputElement;
      const isSearchMode = inputElement?.dataset?.searchMode === "true";
      
      if (isSearchMode) {
        this.actionProvider.handleSearchQuery(message);
        // Search mode was already reset in the SearchButton component
      } else {
        this.actionProvider.handleUserMessage(message);
      }
    }
  }

  setSearchMode(isSearch: boolean) {
    this.isSearchMode = isSearch;
  }
}

export default MessageParser;
