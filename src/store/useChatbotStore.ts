// src/store/useChatbotStore.ts
import { create } from "zustand";

interface ChatMessage {
  sender: string;
  text: string;
}

interface ChatbotState {
  sessionId: string;
  chatMessages: ChatMessage[];
  setSessionId: (id: string) => void;
  addMessage: (message: ChatMessage) => void;
}

export const useChatbotStore = create<ChatbotState>((set) => ({
  sessionId: "",
  chatMessages: [],
  setSessionId: (id) => set({ sessionId: id }),
  addMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),
}));
