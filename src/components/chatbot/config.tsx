import React from 'react';
import { createChatBotMessage } from "react-chatbot-kit";
import SearchButton from './SearchButton';

const botName = "AI Curation Bot";

const config = {
  botName: botName,
  initialMessages: [createChatBotMessage(`Hello! How can I assist you?`, {})],
  customStyles: {
    botMessageBox: {
      backgroundColor: "#393834",
    },
    chatButton: {
      backgroundColor: "#2d2d2d",
    },
  },
  customComponents: {
    header: () => (
      <div className="react-chatbot-kit-chat-header" style={{display: 'flex', alignItems: 'center'}}>
        <span>{botName}</span>
        <div style={{ marginLeft: 'auto' }}>
          <SearchButton />
        </div>
      </div>
    ),
  },
  state: {}
};

export default config; 