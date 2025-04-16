import { useChatbotStore } from "@/store/useChatbotStore";

class ActionProvider {
  createChatBotMessage: any;
  setState: any; // Added to manage chatbot state updates

  constructor(createChatBotMessage: any, setState: any) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setState;
  }

  handleUserMessage = async (message: string) => {
    const { sessionId, addMessage } = useChatbotStore.getState();

    if (!sessionId) {
      console.error("Session ID is missing! Cannot send message.");
      return;
    }

    // Save user message in the store
    addMessage({ sender: "user", text: message });

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
      console.log(
        "$$$$$ ACTION PROVIDER DATA and data.answer &&&&&",
        data,
        data.answer
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
}

export default ActionProvider;
