// components/trainingColumns/TrainingTopColumn.tsx
"use client";
import { apiBase } from "@/lib/api";
import { useEffect, useRef, useState } from "react";

interface TerminalLine {
  id: string;
  timestamp: string;
  content: string;
  type: "info" | "success" | "warning" | "error" | "command";
}

export default function TrainingTopMiddle() {
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    {
      id: "1",
      timestamp: new Date().toLocaleTimeString(),
      content: "Training system initialized",
      type: "info",
    },
    {
      id: "2",
      timestamp: new Date().toLocaleTimeString(),
      content: "Waiting for training commands...",
      type: "info",
    },
  ]);
  const [isConnected, setIsConnected] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  // Function to add new terminal lines (for future backend integration)
  const addTerminalLine = (
    content: string,
    type: TerminalLine["type"] = "info"
  ) => {
    const newLine: TerminalLine = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      content,
      type,
    };
    setTerminalLines((prev) => [...prev, newLine]);
  };

  // Function to clear terminal
  const clearTerminal = () => {
    setTerminalLines([]);
  };

  // Listen for app-wide event to start streaming logs
  useEffect(() => {
    function handleStartStream(e: Event) {
      const detail = (e as CustomEvent).detail as { jobId: string };
      const { jobId } = detail || {};
      if (!jobId) return;

      // Close previous stream if any
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      const url = `${apiBase}/api/training/stream/${jobId}`;
      const es = new EventSource(url);
      eventSourceRef.current = es;
      setIsConnected(true);
      addTerminalLine(`Connected to job ${jobId}`, "info");

      es.onmessage = (ev) => {
        const text = ev.data as string;
        if (text) addTerminalLine(text, "info");
      };
      es.onerror = () => {
        addTerminalLine("[stream] disconnected", "warning");
        setIsConnected(false);
        es.close();
        eventSourceRef.current = null;
      };
    }

    window.addEventListener("start-training-stream", handleStartStream as EventListener);
    return () => {
      window.removeEventListener("start-training-stream", handleStartStream as EventListener);
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, []);

  const getLineColor = (type: TerminalLine["type"]) => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      case "command":
        return "text-blue-300";
      default:
        return "text-gray-200";
    }
  };

  return (
    <div className="h-full bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <h2 className="text-text-default text-lg font-semibold">
            Training Terminal
          </h2>
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-400" : "bg-red-400"
              }`}
            />
            <span className="text-sm text-gray-500">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex space-x-2">
          <button
            onClick={clearTerminal}
            className="px-3 py-1 bg-gray-700 text-text-default rounded text-sm hover:bg-gray-600 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-gray-950"
      >
        {terminalLines.length === 0 ? (
          <div className="text-gray-500 italic">
            Terminal output will appear here...
          </div>
        ) : (
          terminalLines.map((line) => (
            <div key={line.id} className="mb-1 flex">
              <span className="text-gray-400 mr-3 min-w-[80px]">
                [{line.timestamp}]
              </span>
              <span className={getLineColor(line.type)}>{line.content}</span>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
