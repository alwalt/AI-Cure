"use client";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useHyperparameters } from "@/store/useHyperparameters";

export default function HyperparameterSettings() {
  // Zustand store
  const {
    maxOutputTokens,
    temperature,
    topP,
    similarityMetric,
    topK,
    isExpanded,
    setMaxOutputTokens,
    setTemperature,
    setTopP,
    setSimilarityMetric,
    setTopK,
    setIsExpanded,
    resetToDefaults,
    getHyperparameters,
  } = useHyperparameters();

  // Handler for apply button (ready for backend integration)
  const handleApplySettings = () => {
    const hyperparams = getHyperparameters();
    console.log("Applying hyperparameters:", hyperparams);
    // TODO: Send hyperparams to backend/training system
  };

  return (
    <div className="bg-surface-contrast rounded-lg">
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-850 transition-colors rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-text-default font-semibold text-lg">
          Hyperparameter Settings
        </h3>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-3 pt-0 space-y-4 border-t border-border-column">
          {/* Max Output Tokens Input */}
          <div className="space-y-2">
            <label className="text-text-default text-xs font-medium">
              Max Output Tokens
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={maxOutputTokens}
              onChange={(e) =>
                setMaxOutputTokens(parseInt(e.target.value) || 1)
              }
              className="w-full bg-gray-850 border border-gray-200 text-text-default text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-focus-default"
              placeholder="Enter max tokens"
            />
          </div>

          {/* Temperature Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-text-default text-xs font-medium">
                Temperature
              </label>
              <span className="text-gray-500 text-xs">{temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={temperature}
              onChange={(e) => setTemperature(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Top P Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-text-default text-xs font-medium">
                Top P
              </label>
              <span className="text-gray-500 text-xs">{topP.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={topP}
              onChange={(e) => setTopP(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Similarity Metric Dropdown */}
          <div className="space-y-2">
            <label className="text-text-default text-xs font-medium">
              Similarity Metric
            </label>
            <select
              value={similarityMetric}
              onChange={(e) => setSimilarityMetric(e.target.value)}
              className="w-full bg-gray-850 border border-gray-200 text-text-default text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-focus-default"
            >
              <option value="cosine">Cosine Similarity</option>
              <option value="euclidean">Euclidean Distance</option>
              <option value="minkowski">Minkowski Distance</option>
            </select>
          </div>

          {/* Top K Input */}
          <div className="space-y-2">
            <label className="text-text-default text-xs font-medium">
              Top K
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value) || 1)}
              className="w-full bg-gray-850 border border-border-column text-text-default text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-focus-default"
              placeholder="Enter top K value"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-border-column space-y-2">
            <button
              onClick={handleApplySettings}
              className="w-full bg-surface-navigation text-text-default py-2 px-4 rounded-md text-sm font-medium transition-colors hover:bg-button-hover-navigation"
            >
              Apply Settings
            </button>
            <button
              onClick={resetToDefaults}
              className="w-full bg-button-emphasis text-text-default py-2 px-4 rounded-md text-sm font-medium transition-colors hover:bg-button-hover-emphasis hover:text-text-hover-emphasis"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: var(--blue-300);
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: var(--blue-300);
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
