import { createChatBotMessage } from "react-chatbot-kit";

const botName = "AI Curation Bot";

const config = {
  botName: botName,
  initialMessages: [createChatBotMessage(`Hello! How can I assist you?`, {})],
};

export default config;
