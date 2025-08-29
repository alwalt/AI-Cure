"use client";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTrainingHyperparameters } from "@/store/useTrainingHyperparameters";

export default function TraingingHyperparameterSettings() {
  // Zustand store
  const {
    learningRate,
    batchSize,
    epochs,
    optimizer,
    momentum,
    dropout,
    regularization,
    validationSplit,
    isExpanded,
    setLearningRate,
    setBatchSize,
    setEpochs,
    setOptimizer,
    setMomentum,
    setDropout,
    setRegularization,
    setValidationSplit,
    setIsExpanded,
    resetToDefaults,
    getHyperparameters,
  } = useTrainingHyperparameters();

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
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-800 transition-colors rounded-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-text-default font-bold text-lg">
          Hyperparameter Settings
        </h3>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-3 mt-2 space-y-4">
          {/* Learning Rate Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-text-default text-xs font-medium">
                Learning Rate
              </label>
              <span className="text-gray-500 text-xs">{learningRate}</span>
            </div>
            <input
              type="range"
              min="0.0001"
              max="0.1"
              step="0.0001"
              value={learningRate}
              onChange={(e) => setLearningRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Batch Size Dropdown */}
          <div className="space-y-2">
            <label className="text-text-default text-xs font-medium">
              Batch Size
            </label>
            <select
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value))}
              className="w-full bg-gray-850 border border-border-accent text-text-default text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-focus-default"
            >
              <option value={8}>8</option>
              <option value={16}>16</option>
              <option value={32}>32</option>
              <option value={64}>64</option>
              <option value={128}>128</option>
              <option value={256}>256</option>
            </select>
          </div>

          {/* Epochs Input */}
          <div className="space-y-2">
            <label className="text-text-default text-xs font-medium">
              Epochs
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={epochs}
              onChange={(e) => setEpochs(parseInt(e.target.value))}
              className="w-full bg-gray-850 border border-border-accent text-text-default text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-focus-default"
            />
          </div>

          {/* Optimizer Dropdown */}
          <div className="space-y-2">
            <label className="text-text-default text-xs font-medium">
              Optimizer
            </label>
            <select
              value={optimizer}
              onChange={(e) => setOptimizer(e.target.value)}
              className="w-full bg-gray-850 border border-border-accent text-text-default text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-focus-default"
            >
              <option value="adam">Adam</option>
              <option value="sgd">SGD</option>
              <option value="rmsprop">RMSprop</option>
              <option value="adamw">AdamW</option>
              <option value="adagrad">Adagrad</option>
            </select>
          </div>

          {/* Momentum Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-text-default text-xs font-medium">
                Momentum
              </label>
              <span className="text-gray-500 text-xs">{momentum}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={momentum}
              onChange={(e) => setMomentum(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Dropout Rate Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-text-default text-xs font-medium">
                Dropout Rate
              </label>
              <span className="text-gray-500 text-xs">{dropout}</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.8"
              step="0.05"
              value={dropout}
              onChange={(e) => setDropout(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Regularization Type */}
          <div className="space-y-2">
            <label className="text-text-default text-xs font-medium">
              Regularization
            </label>
            <select
              value={regularization}
              onChange={(e) => setRegularization(e.target.value)}
              className="w-full bg-gray-850 border border-border-accent text-text-default text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-focus-default"
            >
              <option value="none">None</option>
              <option value="l1">L1 (Lasso)</option>
              <option value="l2">L2 (Ridge)</option>
              <option value="elastic">Elastic Net</option>
            </select>
          </div>

          {/* Validation Split Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-text-default text-xs font-medium">
                Validation Split
              </label>
              <span className="text-gray-500 text-xs">{validationSplit}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.4"
              step="0.05"
              value={validationSplit}
              onChange={(e) => setValidationSplit(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
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
