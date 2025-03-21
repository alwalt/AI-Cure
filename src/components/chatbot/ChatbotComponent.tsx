import React from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css"; // This applies the default styles (we will override with Tailwind later)

import config from "./config";
import MessageParser from "./MessageParser";
import ActionProvider from "./ActionProvider";

export default function ChatbotComponent() {
  return (
    <div className="fixed bottom-4 right-4 w-80 border border-gray-300 rounded-lg shadow-lg bg-white">
      <Chatbot
        config={config}
        messageParser={MessageParser}
        actionProvider={ActionProvider}
      />
    </div>
  );
}
