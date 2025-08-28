// components/trainingColumns/TrainingTopColumn.tsx
"use client";
import { useState, useEffect, useRef } from "react";

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

  // Mock function to simulate training output (remove when backend is ready)
  const simulateTrainingOutput = () => {
    const mockOutputs = [
      { content: "Loading training dataset...", type: "info" as const },
      {
        content: "Dataset loaded successfully (10,000 samples)",
        type: "success" as const,
      },
      { content: "Initializing model architecture", type: "info" as const },
      { content: "Starting training epoch 1/10", type: "info" as const },
      {
        content: "Epoch 1 complete - Loss: 0.234, Accuracy: 87.3%",
        type: "success" as const,
      },
      {
        content: "Warning: Learning rate may be too high",
        type: "warning" as const,
      },
      { content: "Adjusting learning rate to 0.001", type: "info" as const },
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < mockOutputs.length) {
        addTerminalLine(mockOutputs[index].content, mockOutputs[index].type);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 1500);
  };

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
        return "text-text-default";
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
            onClick={simulateTrainingOutput}
            className="px-3 py-1 bg-blue-700 text-button-navigation rounded text-sm hover:bg-button-hover-navigation transition-colors"
          >
            Start Training
          </button>
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
              <span className="text-gray-500 mr-3 min-w-[80px]">
                [{line.timestamp}]
              </span>
              <span className={getLineColor(line.type)}>{line.content}</span>
            </div>
          ))
        )}
      </div>

      {/* Command Input Area (for future use) */}
      <div className="border-t border-gray-800 p-3">
        <div className="flex items-center space-x-2">
          <span className="text-blue-300 font-mono">$</span>
          <input
            type="text"
            placeholder="Enter training commands... (backend integration pending)"
            className="flex-1 bg-transparent text-text-default font-mono text-sm outline-none placeholder-gray-500"
            disabled={!isConnected}
          />
        </div>
      </div>
    </div>
  );
}
