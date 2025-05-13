import React from 'react';
import { createCustomMessage } from "react-chatbot-kit";
import SearchButton from './SearchButton';
import MarkdownMessage from './MarkdownMessage';

export const botName = "AI Curation Bot";

// Create initial message for Markdown
const initialMarkdown = `# Welcome to **${botName}**!\nAsk me anything.`;
const initialMessageObject = createCustomMessage(
  initialMarkdown,
  "markdown",
  {} 
);
// Manually add the messageId to its payload
initialMessageObject.payload = { 
  ...initialMessageObject.payload, 
  messageId: initialMessageObject.id 
};
console.log("[Config] Initial Message Object with Payload:", JSON.stringify(initialMessageObject, null, 2));

const config = {
  botName: botName,
  // Use the modified Markdown message object
  initialMessages: [ initialMessageObject ], 
  // Add customMessages for Markdown
  customMessages: {
    markdown: (props: any) => <MarkdownMessage {...props} />,
  },
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
};

export default config; 