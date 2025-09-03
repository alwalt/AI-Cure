"use client";
import { useState } from "react";
import axios from "axios";
import { apiBase } from "@/lib/api";
import { useTrainingHyperparameters } from "@/store/useTrainingHyperparameters";
import { useDataSets } from "@/store/useDataSets";

export default function TrainingModelSelection() {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState<string>("");

  const { selectedModel, setSelectedModel, getHyperparameters } =
    useTrainingHyperparameters();
  const { getSelectedDataSets } = useDataSets();

  const handleTraining = async () => {
    const trainingConfig = getHyperparameters();
    const selectedDataSets = getSelectedDataSets();

    // Validation
    if (selectedDataSets.length === 0) {
      setTrainingStatus("Please select at least one dataset for training");
      return;
    }

    console.log("Starting training with config:", trainingConfig);
    console.log(
      "Selected datasets:",
      selectedDataSets.map((ds) => ds.name)
    );

    setIsTraining(true);
    setTrainingStatus("Initializing training...");

    try {
      // Prepare training payload matching your SFTTrainer backend
      const trainingPayload = {
        model: selectedModel,
        datasets: selectedDataSets.map((ds) => ({
          name: ds.name,
          type: ds.type,
          id: ds.id,
        })),
        hyperparameters: {
          // Map your frontend params to SFTConfig params
          per_device_train_batch_size: trainingConfig.batchSize,
          learning_rate: trainingConfig.learningRate,
          num_train_epochs: trainingConfig.epochs,
          optim:
            trainingConfig.optimizer === "adamw"
              ? "adamw_8bit"
              : trainingConfig.optimizer,
          weight_decay: 0.01, // You might want to add this to your store
          lr_scheduler_type: "linear",
          max_steps: 60, // You might want to make this configurable
          warmup_steps: 5,
          gradient_accumulation_steps: 4,
          logging_steps: 1,
          seed: 3407,
          report_to: "none",
          dataset_text_field: "text", // Default field name
          // Add other SFTConfig parameters as needed
        },
      };

      const response = await axios.post(
        `${apiBase}/api/start_training`, // Suggested endpoint name
        trainingPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 120000, // 2 minute timeout for training initiation
          withCredentials: true,
        }
      );

      setTrainingStatus("Training started successfully!");
      console.log("Training response:", response.data);

      // TODO: You might want to start polling for training status updates
      // or establish a WebSocket connection for real-time updates
    } catch (error) {
      console.error("Error starting training:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
        setTrainingStatus(
          `Training failed: ${error.response?.data?.message || error.message}`
        );
      } else {
        setTrainingStatus("Training failed: Unknown error");
      }
    } finally {
      setIsTraining(false);
    }
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
            disabled={isTraining}
            className="w-full bg-gray-850 border border-border-accent text-text-default text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-focus-default disabled:opacity-50"
          >
            <option value="llama3.2">Llama 3.2</option>
            <option value="llama3.1">Llama 3.1</option>
            <option value="llava">Llava</option>
          </select>
        </div>

        {/* Status Display */}
        {trainingStatus && (
          <div
            className={`text-xs p-2 rounded ${
              trainingStatus.includes("failed") ||
              trainingStatus.includes("error")
                ? "bg-red-900/20 text-red-400 border border-red-600"
                : trainingStatus.includes("successfully")
                ? "bg-green-900/20 text-green-400 border border-green-600"
                : "bg-blue-900/20 text-blue-400 border border-blue-600"
            }`}
          >
            {trainingStatus}
          </div>
        )}

        {/* Train Button */}
        <button
          onClick={handleTraining}
          disabled={isTraining}
          className="w-full bg-surface-navigation text-text-default py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 hover:bg-button-hover-navigation hover:font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTraining ? "Starting Training..." : "Train"}
        </button>
      </div>
    </div>
  );
}
