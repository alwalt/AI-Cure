// src/store/useChatbotStore.ts
import { create } from "zustand";

interface ChatMessage {
  sender: string;
  text: string;
}

interface ChatbotState {
  sessionId: string;
  chatMessages: ChatMessage[];
  isSearchMode: boolean;
  setSessionId: (id: string) => void;
  addMessage: (message: ChatMessage) => void;
  setSearchMode: (on: boolean) => void;
}

export const useChatbotStore = create<ChatbotState>((set) => ({
  sessionId: "",
  chatMessages: [],
  isSearchMode: false,    
  setSessionId: (id) => set({ sessionId: id }),
  addMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  setSearchMode: (on) => set({ isSearchMode: on }),
}));
