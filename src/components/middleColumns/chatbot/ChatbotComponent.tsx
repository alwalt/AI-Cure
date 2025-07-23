"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSessionFileStore } from "@/store/useSessionFileStore";
import {
  AlertCircle,
  ChevronDown,
  MessageCircle,
  Search,
  Send,
} from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import SettingsButton from "@/components/base/SettingsButton";
import { apiBase } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isSearchResult?: boolean;
  isError?: boolean;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState("llama3.1");
  const [showSettings, setShowSettings] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const { loadingSession } = useSessionFileStore();
  const availableModels = [
    { value: "llama3.1", label: "Llama 3.1" },
    { value: "llama3.2", label: "Llama 3.2" },
    { value: "llava", label: "Llava" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          isSearchMode,
          model: selectedModel,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to process chat request");
      }

      setMessages((prev) => [...prev, responseData]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "Sorry, I encountered an error processing your request. Please try again.",
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  if (loadingSession) {
    return (
      <div className="flex flex-col h-full bg-gray-900/50 border border-gray-700/50 rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-gray-800/30 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <MessageCircle className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-100">AI Curation Bot</h3>
              <p className="text-sm text-gray-400">Initializing session...</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SettingsButton
              onClick={() => setShowSettings(!showSettings)}
              iconClassName="w-4 h-4 text-gray-400 hover:text-gray-200"
              spanClassName="left-1/2 -translate-x-1/2 mt-2"
              tooltipId="chatbot-settings-tooltip"
              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="text-gray-600 cursor-not-allowed"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Chat Messages Area with Loading Indicator */}
        <ScrollArea className="flex-1 p-4">
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-700 border-t-blue-400" />
              <div className="text-center">
                <p className="text-gray-300 font-medium">
                  Initializing Session
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Setting up your AI assistant...
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Input Form - Disabled */}
        <div className="p-4 border-t border-gray-700/50 bg-gray-800/20">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                placeholder="Initializing..."
                disabled
                className="pr-12 bg-gray-800/30 border-gray-700 text-gray-500 placeholder-gray-600 cursor-not-allowed"
              />
            </div>
            <SettingsButton
              onClick={() => setShowSettings(!showSettings)}
              iconClassName="w-4 h-4 text-gray-400 hover:text-gray-200"
              spanClassName="left-1/2 -translate-x-1/2 mt-2"
              tooltipId="chatbot-settings-tooltip"
              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-600">
              Preparing chat environment...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900/50 border border-gray-700/50 rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-gray-800/30 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <MessageCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-100">AI Curation Bot</h3>
            <p className="text-sm text-gray-400">
              Model:{" "}
              {availableModels.find((m) => m.value === selectedModel)?.label}
              {isSearchMode && " • OSDR Search Mode"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SettingsButton
            onClick={() => setShowSettings(!showSettings)}
            iconClassName="w-4 h-4 text-gray-400 hover:text-gray-200"
            spanClassName="left-1/2 -translate-x-1/2 mt-2"
            tooltipId="chatbot-settings-tooltip"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-gray-800/50 border-b border-gray-700/50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Model Selection
              </label>
            </div>

            {/* Custom Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-gray-200 hover:bg-gray-700/50"
              >
                <div className="flex items-center gap-2">
                  <span>
                    {
                      availableModels.find((m) => m.value === selectedModel)
                        ?.label
                    }
                  </span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showModelDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10">
                  {availableModels.map((model) => (
                    <button
                      key={model.value}
                      onClick={() => {
                        setSelectedModel(model.value);
                        setShowModelDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-gray-200 hover:bg-gray-700 first:rounded-t-md last:rounded-b-md flex items-center justify-between"
                    >
                      <span>{model.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Search Mode
              </label>
              <Button
                variant={isSearchMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsSearchMode(!isSearchMode)}
                className={
                  isSearchMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border-gray-600 text-gray-700 hover:bg-gray-700"
                }
              >
                <Search className="w-4 h-4 mr-2" />
                OSDR Search
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 max-w-md mx-auto">
                <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">
                  Start a conversation with the AI Curation Bot.
                  {isSearchMode
                    ? " OSDR search mode is enabled."
                    : " Switch to search mode for OSDR queries."}
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white shadow-lg"
                    : message.isError
                    ? "bg-red-900/30 text-red-100 border border-red-700/50"
                    : message.isSearchResult
                    ? "bg-green-900/30 text-gray-100 border border-green-700/50"
                    : "bg-gray-800/60 text-gray-100 border border-gray-700/30"
                }`}
              >
                {message.isError && (
                  <div className="flex items-center gap-1 mb-2 text-xs text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    Error
                  </div>
                )}
                {message.role === "user" ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                ) : (
                  <div className="text-sm leading-relaxed prose prose-invert max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                )}
                {message.isSearchResult && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
                    <Search className="w-3 h-3" />
                    OSDR Search Result
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800/60 border border-gray-700/30 rounded-2xl px-4 py-3 max-w-[85%]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                  <span className="text-sm text-gray-400">
                    AI is thinking... (using{" "}
                    {
                      availableModels.find((m) => m.value === selectedModel)
                        ?.label
                    }
                    )
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Form */}
      <div className="p-4 border-t border-gray-700/50 bg-gray-800/20">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isSearchMode
                  ? "Search OSDR database..."
                  : "Type your message..."
              }
              disabled={isLoading}
              className="pr-12 bg-gray-800/50 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
            />
            {isSearchMode && (
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            )}
          </div>
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-500">
            Using{" "}
            {availableModels.find((m) => m.value === selectedModel)?.label}
          </span>
          {isSearchMode && (
            <span className="text-xs bg-green-900/20 text-green-400 px-2 py-1 rounded-full border border-green-700/30">
              OSDR Search Active
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
