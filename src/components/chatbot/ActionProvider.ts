import { useChatbotStore } from "@/store/useChatbotStore";
import { apiBase } from '@/lib/api';

class ActionProvider {
  createChatBotMessage: any;
  setState: any; // Added to manage chatbot state updates

  constructor(createChatBotMessage: any, setState: any) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setState;
    (window as any).chatActionProvider = this;

    console.log('ActionProvider constructor called, exposed as window.chatActionProvider');
  }

  handleUserMessage = async (message: string) => {
    console.log('handleUserMessage called with:', message);
    const { sessionId, addMessage } = useChatbotStore.getState();

    if (!sessionId) {
      console.error("Session ID is missing! Cannot send message.");
      return;
    }

    // Save user message in the store
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
        throw new Error(
          `Failed to fetch chatbot response: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log(
        "Regular chat response received:",
        data
      );
      if (data.answer) {
        const botMessage = this.createChatBotMessage(data.answer);
        this.setState((prevState: any) => ({
          ...prevState,
          messages: [...prevState.messages, botMessage],
        }));
        addMessage({ sender: "bot", text: data.answer });
      } else {
        console.error("No answer received from chatbot.");
      }
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
    }
  };

  handleSearchQuery = async (message: string) => {
    console.log('handleSearchQuery called with:', message);
    const { addMessage } = useChatbotStore.getState();

    // Save user search message in the store
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
        throw new Error(
          `Failed to fetch search response: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Search response received:", data);
      
      if (data.response) {
        const botMessage = this.createChatBotMessage(data.response);
        this.setState((prevState: any) => ({
          ...prevState,
          messages: [...prevState.messages, botMessage],
        }));
        addMessage({ sender: "bot", text: data.response });
      } else {
        console.error("No search results received.");
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };
}

export default ActionProvider;
