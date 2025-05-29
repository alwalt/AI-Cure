import { useChatbotStore } from "@/store/useChatbotStore";
import { apiBase } from "@/lib/api";
import { createChatBotMessage } from "react-chatbot-kit";

// infer the type of the message‐factory fn
type CreateChatBotMessageFunc = typeof createChatBotMessage;
// your own setState type (tighten `any` to your ChatbotState if you have it)
type SetStateFunc = (updater: (prevState: any) => any) => void;

interface ChatResponse {
  answer: string;
}

class ActionProvider {
  private createChatBotMessage: CreateChatBotMessageFunc;
  private setState: SetStateFunc;

  constructor(
    createChatBotMessage: CreateChatBotMessageFunc,
    setState: SetStateFunc
  ) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setState;
    (window as any).chatActionProvider = this;
  }

  async handleUserMessage(message: string): Promise<void> {
    console.log("handleUserMessage called with:", message);
    const { sessionId, addMessage } = useChatbotStore.getState();

    if (!sessionId) {
      console.error("Session ID is missing! Cannot send message.");
      return;
    }

    // Save user message in the store
    addMessage({ sender: "user", text: message });

    try {
      // console.log('Calling regular chat endpoint /api/get_chat_response with message:', message);
      const response = await fetch(
        `${apiBase}/api/get_chat_response/${sessionId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: message }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch chatbot response: ${response.statusText}`
        );
      }

      const data = (await response.json()) as ChatResponse;
      if (!data.answer) return console.error("No answer!");

      const botMsg = this.createChatBotMessage(data.answer, {});
      this.setState((prev) => ({
        ...prev,
        messages: [...prev.messages, botMsg],
      }));
      addMessage({ sender: "bot", text: data.answer });
    } catch (err) {
      console.error("Chat error:", err);
    }
  }

  async handleSearchQuery(message: string): Promise<void> {
    const { addMessage } = useChatbotStore.getState();
    // Save user search message in the store
    addMessage({ sender: "user", text: `${message}` });

    try {
      console.log(
        "Calling search endpoint /api/mcp_query with query:",
        message
      );
      const response = await fetch(`${apiBase}/api/mcp_query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: message }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch search response: ${response.statusText}`
        );
      }

      const data = (await response.json()) as { response: string };
      if (!data.response) return console.error("No search results.");

      const botMsg = this.createChatBotMessage(data.response, {});
      this.setState((prev) => ({
        ...prev,
        messages: [...prev.messages, botMsg],
      }));
      addMessage({ sender: "bot", text: data.response });
    } catch (err) {
      console.error("Search error:", err);
    }
  }
}

export default ActionProvider;
