import { useChatbotStore } from "@/store/useChatbotStore";
import type ActionProvider from "./ActionProvider"; // import the real class/type

export default class MessageParser {
  private actionProvider: ActionProvider; // no more `any`

  constructor(actionProvider: ActionProvider) {
    // typed to the real class
    this.actionProvider = actionProvider;
  }

  parse(message: string): void {
    if (!message.trim()) {
      return;
    }

    const { isSearchMode } = useChatbotStore.getState();

    // use a normal if/else for side-effects, not a ternary expression
    if (isSearchMode) {
      this.actionProvider.handleSearchQuery(message);
    } else {
      this.actionProvider.handleUserMessage(message);
    }
  }
}
