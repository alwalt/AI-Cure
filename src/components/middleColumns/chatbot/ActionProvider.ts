import { useChatbotStore } from "@/store/useChatbotStore";
import { apiBase } from "@/lib/api";
import { createChatBotMessage } from "react-chatbot-kit";

// 1. Capture the exact type of a chat message:
//    createChatBotMessage(text, options) -> ChatBotMessage
type CreateChatBotMessageFunc = typeof createChatBotMessage;

// 2. Define your chatbot’s slice of state
interface ChatbotState {
  messages: ReturnType<CreateChatBotMessageFunc>[];
  // (add any other pieces of state you use in your store here)
}

// 0️⃣ Extend the Window interface
declare global {
  interface Window {
    chatActionProvider?: ActionProvider;
  }
}

// 3. Strongly type setState so updater “prev” is ChatbotState
type SetStateFunc = (
  updater: (prevState: ChatbotState) => ChatbotState
) => void;

// shape of your JSON from the API
interface ChatResponse {
  answer: string;
}

class ActionProvider {
  private messageFactory: CreateChatBotMessageFunc;
  private setState: SetStateFunc;

  constructor(
    messageFactory: CreateChatBotMessageFunc,
    setState: SetStateFunc
  ) {
    this.messageFactory = messageFactory;
    this.setState = setState;
    window.chatActionProvider = this;
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

      const botMsg = this.messageFactory(data.answer, {});
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

      const botMsg = this.messageFactory(data.response, {});
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
