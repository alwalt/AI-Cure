import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageObject {
  id: number | string;
  message: string;
  type: string;
  payload?: any;
  widget?: string;
  delay?: number;
  withAvatar?: boolean;
}

interface CustomMessageProps {
  state?: { messages?: MessageObject[] };
  payload?: { messageId?: number | string; [key: string]: any };
  [key: string]: any;
}

const MarkdownMessage: React.FC<CustomMessageProps> = (props) => {
  console.log("[MarkdownMessage - customMessages] PROPS RECEIVED:", JSON.stringify(props, null, 2));

  let markdownContent: string | undefined = undefined;
  let messageToRender: MessageObject | undefined = undefined;
  
  const messageId = props.payload?.messageId; 

  console.log(`[MarkdownMessage] Trying to find message using ID from Payload: ${messageId}`);

  if (messageId && props.state?.messages) {
    messageToRender = props.state.messages.find(msg => String(msg.id) === String(messageId)); 
    if (messageToRender) {
      markdownContent = messageToRender.message;
      console.log(`[MarkdownMessage] Found message by ID [${messageId}] in props.state.messages:`, messageToRender);
    } else {
       console.warn(`[MarkdownMessage] ID [${messageId}] found in payload, but message not found in props.state.messages yet.`);
    }
  } 

  if (typeof markdownContent !== 'string') {
    const reason = messageId ? "Message content not found in state for payload ID" : "No messageId found in payload";
    console.error(`[MarkdownMessage] Error: ${reason} [${String(messageId)}]. Full Props:`, props);
    // Render a minimal error message within the bubble structure
    return (
      <div className="react-chatbot-kit-chat-bot-message">
        <div className="react-chatbot-kit-chat-bot-message-arrow"></div>
        <div className="bot-markdown-error">Error: {reason} ({String(messageId)}). See console.</div>
      </div>
    );
  }

  // Avatar logic is removed. The component now only renders the message bubble.
  return (
    <div className="react-chatbot-kit-chat-bot-message"> {/* This is the main bubble */}
      <div className="react-chatbot-kit-chat-bot-message-arrow"></div>
      <div className="bot-markdown">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ node, ...linkProps }) => (
              <a {...linkProps} target="_blank" rel="noopener noreferrer">
                {linkProps.children}
              </a>
            ),
          }}
        >
          {markdownContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownMessage;
