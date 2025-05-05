import React from 'react';
import { createChatBotMessage } from "react-chatbot-kit";
import SearchButton from './SearchButton';

const botName = "AI Curation Bot";

// Define our widget with the required properties
const searchButtonWidget = {
  widgetName: "searchButton",
  widgetFunc: (props: any) => <SearchButton {...props} />,
  mapStateToProps: [],
  props: {}
};

const config = {
  botName: botName,
  initialMessages: [createChatBotMessage(`Hello! How can I assist you?`, {})],
  widgets: [searchButtonWidget],
  customStyles: {
    botMessageBox: {
      backgroundColor: "#393834",
    },
    chatButton: {
      backgroundColor: "#2d2d2d",
    },
  },
  customComponents: {
    header: ({state, messageParser, actionProvider, createChatBotMessage, setState}: any) => (
      <div className="react-chatbot-kit-chat-header" style={{display: 'flex', alignItems: 'center'}}>
        <span>{botName}</span>
        <div style={{ marginLeft: 'auto' }}>
          <SearchButton onSearch={(query) => actionProvider.handleSearchQuery(query)} />
        </div>
      </div>
    ),
  },
  state: {}
};

export default config; 