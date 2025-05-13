import { useChatbotStore } from "@/store/useChatbotStore";
import { apiBase } from '@/lib/api';

class ActionProvider {
  constructor(
    private createChatBotMessageFn: any,
    private setState:            (fn: (prev: any) => any) => void,
    private createClientMessage: any,
    private stateRef:           any,
    private createCustomMessage: (text: string, type: string, options?: any) => any
  ) {
    (window as any).chatActionProvider = this;
    console.log('[ActionProvider] constructor called (modified for Markdown)');
  }

  private pushMarkdown(markdownString: string, isError: boolean = false) {
    console.log(`[ActionProvider] pushMarkdown called with (isError: ${isError}):`, markdownString);
    const messageOptions = {}; // Add any default options if necessary
    
    const botMsg = this.createCustomMessage(markdownString, "markdown", messageOptions);
    botMsg.payload = { ...botMsg.payload, messageId: botMsg.id };
    
    console.log("[ActionProvider] Message object for Markdown:", JSON.stringify(botMsg, null, 2));

    this.setState((prevState: any) => {
      const newMessages = [...prevState.messages, botMsg];
      console.log(`[ActionProvider] setState for Markdown (isError: ${isError}) - newMessages:`, JSON.stringify(newMessages.map(m => ({id: m.id, message: m.message, type: m.type, payload: m.payload})), null, 2));
      return { ...prevState, messages: newMessages };
    });

    // Also update the Zustand store
    const store = useChatbotStore.getState();
    store.addMessage({ sender: "bot", text: markdownString });
  }

  private handleError(errorMessageText: string) {
    const formattedError = `❌ **Error:** ${String(errorMessageText)}`;
    this.pushMarkdown(formattedError, true);
  }

  handleUserMessage = async (message: string) => {
    console.log('handleUserMessage called with:', message);
    const { sessionId, addMessage } = useChatbotStore.getState();

    if (!sessionId) {
      console.error("Session ID is missing! Cannot send message.");
      this.handleError("Session not initialised.");
      return;
    }
    addMessage({ sender: "user", text: message });

    try {
      console.log('Calling regular chat endpoint /api/get_chat_response with message:', message);
      const response = await fetch(
        `${apiBase}/api/get_chat_response/${sessionId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: message }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "Could not read error body");
        console.error("[ActionProvider] API Error Status:", response.status, response.statusText, "Body:", errorBody);
        throw new Error(`${response.statusText} - ${errorBody}`);
      }

      const data = await response.json();
      console.log("Regular chat response received:", data);
      if (data.answer) {
        this.pushMarkdown(data.answer); // Use pushMarkdown
      } else {
        console.error("No answer received from chatbot.");
        this.pushMarkdown("_(no answer from API)_");
      }
    } catch (error: any) {
      console.error("Error fetching chatbot response:", error);
      this.handleError(error.message || "Failed to fetch response");
    }
  };

  handleSearchQuery = async (message: string) => {
    console.log('handleSearchQuery called with:', message);
    const { addMessage } = useChatbotStore.getState();
    addMessage({ sender: "user", text: `${message}` });

    try {
      console.log('Calling search endpoint /api/mcp_query with query:', message);
      const response = await fetch(
        `${apiBase}/api/mcp_query`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: message }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "Could not read error body");
        console.error("[ActionProvider] Search API Error Status:", response.status, response.statusText, "Body:", errorBody);
        throw new Error(`${response.statusText} - ${errorBody}`);
      }

      const data = await response.json();
      console.log("Search response received:", data);
      
      if (data.response) {
        this.pushMarkdown(data.response); // Use pushMarkdown
      } else {
        console.error("No search results received.");
        this.pushMarkdown("_(no result from search)_");
      }
    } catch (error: any) {
      console.error("Error fetching search results:", error);
      this.handleError(error.message || "Failed during search");
    }
  };
}

export default ActionProvider;
