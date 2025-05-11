import { useChatbotStore } from "@/store/useChatbotStore";

class MessageParser {
  actionProvider: any;
  constructor(actionProvider: any) {
    this.actionProvider = actionProvider;
  }

  parse(message: string) {
   if (!message.trim()) return;
   const { isSearchMode } = useChatbotStore.getState(); 
    isSearchMode
      ? this.actionProvider.handleSearchQuery(message)
      : this.actionProvider.handleUserMessage(message);
  }
}
export default MessageParser;