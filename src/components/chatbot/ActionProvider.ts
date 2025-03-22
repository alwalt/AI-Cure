import { useChatbotStore } from "@/store/useChatbotStore";

class ActionProvider {
  sessionId: string;
  addMessage: (message: { sender: string; text: string }) => void;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.addMessage = useChatbotStore.getState().addMessage; // Store function reference
  }

  handleMessage = (message: string) => {
    this.addMessage({ sender: "user", text: message });
  };
}

export default ActionProvider;
