"use client";
import React, { useEffect, useState, useRef } from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import "./chatbot.css";
// @ts-ignore
import config from "./config.tsx";
import MessageParser from "./MessageParser";
import ActionProvider from "./ActionProvider";
import { useChatbotStore } from "@/store/useChatbotStore";
import { apiBase } from '@/lib/api'; 

console.log('[DEBUG] apiBase:', apiBase);  

// Create singleton instances outside the component
let messageParserInstance: MessageParser | null = null;
let actionProviderInstance: ActionProvider | null = null;

export default function ChatbotComponent() {
  const { sessionId, setSessionId } = useChatbotStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize singleton instances once
    if (!actionProviderInstance || !messageParserInstance) {
      actionProviderInstance = new ActionProvider(undefined, undefined);
      messageParserInstance = new MessageParser(actionProviderInstance);
      (window as any).messageParserInstance = messageParserInstance;
    }

    const init = async () => {
      console.log('ChatbotComponent initializing...');
      if (!sessionId) {
        try {
          console.log('No session ID found, creating vectorstore...');
          const res1 = await fetch(`${apiBase}/api/create_vectorstore`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ embedding_model: "nomic-ai/nomic-embed-text-v1.5", documents: JSON.stringify([{ page_content: "Test doc", metadata: {} }]) }),
          });
          const d1 = await res1.json();
          if (d1.session_id) {
            console.log('Vectorstore created with session ID:', d1.session_id);
            console.log('Creating chatbot...');
            await fetch(`${apiBase}/api/create_chatbot/${d1.session_id}`, { 
              method: "POST", 
              headers: { "Content-Type": "application/json" }, 
              body: JSON.stringify({ model_name: "llama3.1", chat_prompt: "You are a helpful assistant." }) 
            });
            setSessionId(d1.session_id);
            console.log('Chatbot created and session ID set.');
          }
        } catch (e) {
          console.error('Error initializing chatbot:', e);
        }
      } else {
        console.log('Using existing session ID:', sessionId);
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
