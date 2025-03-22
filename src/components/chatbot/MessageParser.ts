class MessageParser {
  actionProvider: any;
  sessionId: string;

  constructor(actionProvider: any, sessionId: string) {
    this.actionProvider = actionProvider;
    this.sessionId = sessionId;
  }

  parse(message: string) {
    if (!this.sessionId) {
      console.error("Session ID is missing!");
      return;
    }

    fetch(`http://127.0.0.1:8000/api/get_chat_response/${this.sessionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ query: message }),
    })
      .then((res) => res.json())
      .then((data) => this.actionProvider.handleResponse(data.answer))
      .catch((err) => console.error("Error fetching chatbot response:", err));
  }
}

export default MessageParser;
