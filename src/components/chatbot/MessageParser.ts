class MessageParser {
  actionProvider: any;
  isSearchMode: boolean;

  constructor(actionProvider: any) {
    this.actionProvider = actionProvider;
    this.isSearchMode = false;
  }

  parse(message: string) {
    if (message.trim()) {
      if (this.isSearchMode) {
        this.actionProvider.handleSearchQuery(message);
        // Reset search mode after handling the query
        this.isSearchMode = false;
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
