class MessageParser {
  actionProvider: any;

  constructor(actionProvider: any) {
    this.actionProvider = actionProvider;
  }

  parse(message: string) {
    if (message.trim()) {
      this.actionProvider.handleUserMessage(message);
    }
  }
}

export default MessageParser;
