"use client";
import React, { useEffect } from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css"; // This applies the default styles (we will override with Tailwind later)
import "./chatbot.css";
import config from "./config";
import MessageParser from "./MessageParser";
import ActionProvider from "./ActionProvider";
import { useChatbotStore } from "@/store/useChatbotStore";

export default function ChatbotComponent() {
  const { sessionId, setSessionId } = useChatbotStore();

  useEffect(() => {
    if (!sessionId) {
      const newSessionId = `session_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);

      // Ensure fetch happens after Zustand state update
      setTimeout(() => {
        fetch(`http://127.0.0.1:8000/api/create_chatbot/${newSessionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            model_name: "llama3",
            chat_prompt: "You are a helpful assistant.",
          }),
        })
          .then((res) => res.json())
          .then((data) => console.log("Chatbot session created:", data))
          .catch((err) => console.error("Error creating chatbot:", err));
      }, 0); // Delay to ensure sessionId updates
    }
    const fetchSession = async () => {
      const requestBody = { sessionId: "session_pfno60db2" }; // Check what you're sending
      console.log("Sending request:", requestBody);

      const response = await fetch(
        "http://127.0.0.1:8000/api/create_chatbot/session_pfno60db2",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();
      console.log("Response received:", data);
    };

    fetchSession();
  }, [sessionId, setSessionId]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <Chatbot
        config={config}
        messageParser={MessageParser}
        actionProvider={ActionProvider}
      />
    </div>
  );
}
