"use client";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTrainingHyperparameters } from "@/store/useTrainingHyperparameters";
import CustomSlider from "@/components/base/CustomSlider";

export default function TrainingHyperparameterSettings() {
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

  // Format functions for different value types
  const formatLearningRate = (value: number) => value.toFixed(4);
  const formatDecimal = (value: number) => value.toFixed(2);
  const formatPercentage = (value: number) => `${(value * 100).toFixed(0)}%`;

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
          <ChevronUp className="w-4 h-4 text-text-default" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-default" />
        )}
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="bg-surface-file-area border-border-file-area border rounded p-2 max-h-[400px] overflow-y-auto">
          <div className="px-4 space-y-4 pt-2">
            {/* Learning Rate Slider */}
            <CustomSlider
              label="Learning Rate"
              value={learningRate}
              min={0.0001}
              max={0.1}
              step={0.0001}
              onChange={setLearningRate}
              formatValue={formatLearningRate}
              formatMinMax={formatLearningRate}
            />

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
            <CustomSlider
              label="Momentum"
              value={momentum}
              min={0}
              max={1}
              step={0.05}
              onChange={setMomentum}
              formatValue={formatDecimal}
              formatMinMax={formatDecimal}
            />

            {/* Dropout Rate Slider */}
            <CustomSlider
              label="Dropout Rate"
              value={dropout}
              min={0}
              max={0.8}
              step={0.05}
              onChange={setDropout}
              formatValue={formatPercentage}
              formatMinMax={formatPercentage}
            />

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
            <CustomSlider
              label="Validation Split"
              value={validationSplit}
              min={0.1}
              max={0.4}
              step={0.05}
              onChange={setValidationSplit}
              formatValue={formatPercentage}
              formatMinMax={formatPercentage}
            />

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleApplySettings}
                className="w-full bg-surface-navigation text-text-default py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 hover:bg-button-hover-navigation hover:font-bold"
              >
                Apply Settings
              </button>
              <button
                onClick={resetToDefaults}
                className="w-full border border-border-accent bg-button-emphasis text-text-default py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 hover:bg-button-hover-navigation hover:text-text-default hover:font-bold hover:border-none"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
