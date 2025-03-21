class ActionProvider {
  createChatBotMessage: any;
  setState: any;

  constructor(createChatBotMessage: any, setStateFunc: any) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }

  handleHello() {
    const message = this.createChatBotMessage("Hi there! How can I help?");
    this.updateChatbotState(message);
  }

  handleUnknown() {
    const message = this.createChatBotMessage(
      "I'm not sure how to respond to that."
    );
    this.updateChatbotState(message);
  }

  updateChatbotState(message: any) {
    this.setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }
}

export default ActionProvider;
