"use client";
import React, { useEffect, useState } from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css"; // This applies the default styles (we will override with Tailwind later)
import "./chatbot.css";
import config from "./config";
import MessageParser from "./MessageParser";
import ActionProvider from "./ActionProvider";
import { useChatbotStore } from "@/store/useChatbotStore";

export default function ChatbotComponent() {
  const { sessionId, setSessionId } = useChatbotStore();
  const [loading, setLoading] = useState(true);

  // Function to fetch session ID from create_vectorstore
  const fetchSessionId = async (): Promise<string | null> => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/create_vectorstore",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embedding_model: "nomic-ai/nomic-embed-text-v1.5",
            documents: JSON.stringify([
              {
                page_content: "This is a test document.",
                metadata: {},
              },
            ]),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create vectorstore: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.session_id) {
        return data.session_id;
      } else {
        throw new Error("session_id missing from vectorstore response");
      }
    } catch (error) {
      console.error("Error fetching session_id:", error);
      return null;
    }
  };

  // Function to create chatbot session using fetched session ID
  const createChatbotSession = async (sessionId: string) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/create_chatbot/${sessionId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model_name: "llama3.2:1b",
            chat_prompt: "You are a helpful assistant.",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to create chatbot session: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.status === "success") {
        setSessionId(sessionId);
      } else {
        console.error("Unexpected chatbot session response:", data);
        throw new Error("Chatbot session creation failed");
      }
    } catch (error) {
      console.error("Error creating chatbot:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeChatbot = async () => {
      if (!sessionId) {
        const newSessionId = await fetchSessionId();
        if (newSessionId) {
          await createChatbotSession(newSessionId);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initializeChatbot();
  }, [sessionId, setSessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-primaryBlack">
        Loading chatbot...
      </div>
    );
  }
  // max-w-full overflow-hidden, on their own didn't help
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
