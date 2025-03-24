import { useChatbotStore } from "@/store/useChatbotStore";

class MessageParser {
  actionProvider: any;

  constructor(actionProvider: any) {
    this.actionProvider = actionProvider;
  }

  async parse(message: string) {
    const sessionId = useChatbotStore.getState().sessionId; // Get sessionId from Zustand

    if (!sessionId) {
      console.error("Session ID is missing! Cannot send message.");
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/get_chat_response/${sessionId}`,
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

      const data = await response.json();
      if (data.answer) {
        this.actionProvider.handleResponse(data.answer);
      } else {
        console.error("No answer received from chatbot.");
      }
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
    }
  }
}

export default MessageParser;
