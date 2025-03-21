import React from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css"; // This applies the default styles (we will override with Tailwind later)
import "./chatbot.css";
import config from "./config";
import MessageParser from "./MessageParser";
import ActionProvider from "./ActionProvider";

export default function ChatbotComponent() {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <Chatbot
        config={config}
        messageParser={MessageParser}
        actionProvider={ActionProvider}
      />
    </div>
  );
}
