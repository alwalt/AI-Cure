"use client";
import { useTrainingHyperparameters } from "@/store/useTrainingHyperparameters";

export default function TrainingModelSelection() {
  const { selectedModel, setSelectedModel, getHyperparameters } =
    useTrainingHyperparameters();

  const handleTraining = () => {
    const trainingConfig = getHyperparameters();
    console.log("Starting training with config:", trainingConfig);
    // TODO: Send training configuration to backend
  };

  return (
    <div className="bg-surface-contrast rounded-lg px-2">
      <h3 className="text-text-default font-bold text-lg">Model Selection</h3>
      <div className="bg-surface-file-area border-border-file-area border rounded p-2 space-y-2">
        {/* Model Dropdown */}
        <div className="space-y-2">
          <label className="text-text-default text-xs font-medium">
            AI Model
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full bg-gray-850 border border-border-accent text-text-default text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-focus-default"
          >
            <option value="llama3.2">Llama 3.2</option>
            <option value="llama3.1">Llama 3.1</option>
            <option value="llava">Llava</option>
          </select>
        </div>

        {/* Train Button */}
        <button
          onClick={handleTraining}
          className="w-full bg-surface-navigation text-text-default py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 hover:bg-button-hover-navigation hover:font-bold"
        >
          Train
        </button>
      </div>
    </div>
  );
}
