"use client";
import { apiBase } from "@/lib/api";
import { useChatbotStore } from "@/store/useChatbotStore";
import { useSessionFileStore } from "@/store/useSessionFileStore";
import { useEffect, useState } from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import ActionProvider from "./ActionProvider.ts";
import "./chatbot.css";
import config from "./config.tsx";
import MessageParser from "./MessageParser.ts";

console.log("[DEBUG] apiBase:", apiBase);

export default function ChatbotComponent() {
  const { sessionId, setSessionId } = useChatbotStore();
  const mainSessionId = useSessionFileStore((state) => state.sessionId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      // Sync chatbot session with main session
      if (mainSessionId && sessionId !== mainSessionId) {
        console.log("Syncing chatbot session with main session:", mainSessionId);
        setSessionId(mainSessionId);
      } else if (!mainSessionId) {
        console.log("No main session ID found, chatbot will wait for collections to be created");
      } else {
        console.log("Using synced session ID:", sessionId);
      }
      setLoading(false);
    };
    init();
  }, [sessionId, setSessionId, mainSessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-primaryBlack">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <Chatbot
        config={config}
        messageParser={MessageParser}
        actionProvider={ActionProvider}
      />
    </div>
  );
}
