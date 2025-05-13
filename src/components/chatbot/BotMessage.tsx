import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/*  Accept any props the library passes.
    (react-chatbot-kit doesn’t export a prop type for custom messages.) */
const BotMessage: React.FC<any> = ({ message }) => (
  <div className="bot-markdown">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node, ...props }) => (
          <a {...props} target="_blank" rel="noreferrer">
            {props.children}
          </a>
        ),
      }}
    >
      {message.message}
    </ReactMarkdown>
  </div>
);

export default BotMessage;
