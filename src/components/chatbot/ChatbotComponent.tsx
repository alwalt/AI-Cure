"use client";
import React, { useEffect, useState } from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import "./chatbot.css";
// @ts-ignore
import config from "./config.tsx";
import MessageParser from "./MessageParser";
import ActionProvider from "./ActionProvider";
import { useChatbotStore } from "@/store/useChatbotStore";

export default function ChatbotComponent() {
  const { sessionId, setSessionId } = useChatbotStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!sessionId) {
        try {
          const res1 = await fetch("http://127.0.0.1:8000/api/create_vectorstore", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ embedding_model: "nomic-ai/nomic-embed-text-v1.5", documents: JSON.stringify([{ page_content: "Test doc", metadata: {} }]) }),
          });
          const d1 = await res1.json();
          if (d1.session_id) {
            await fetch(`http://127.0.0.1:8000/api/create_chatbot/${d1.session_id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model_name: "llama3.1", chat_prompt: "You are a helpful assistant." }) });
            setSessionId(d1.session_id);
          }
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    };
    init();
  }, [sessionId, setSessionId]);

  if (loading) {
    return <div className="flex items-center justify-center h-full bg-primaryBlack">Loading...</div>;
  }

  return (
    <div className="flex flex-col flex-grow-0">
      <Chatbot
        config={config}
        messageParser={MessageParser}
        actionProvider={ActionProvider}
      />
    </div>
  );
}
