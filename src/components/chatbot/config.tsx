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
    header: (props) => (
      <div className="react-chatbot-kit-chat-header">
        {botName}
        <div style={{ marginLeft: 'auto' }}>
          {props.widgets && props.widgets.searchButton}
        </div>
      </div>
    ),
  },
  state: {}
};

export default config; 