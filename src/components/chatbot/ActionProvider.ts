import { useChatbotStore } from "@/store/useChatbotStore";

class ActionProvider {
  createChatBotMessage: any;

  constructor(createChatBotMessage: any) {
    this.createChatBotMessage = createChatBotMessage;
  }

  handleMessage = (message: string) => {
    const { addMessage } = useChatbotStore.getState();
    addMessage({ sender: "user", text: message });
  };
}

export default ActionProvider;
