"use client";
import { useState, Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Trash2 } from "lucide-react";
import Button from "@/components/base/Button";
import { useDataSets } from "@/store/useDataSets";

export default function ClearDataSetsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const { uploadedDataSets, clearAllDataSets } = useDataSets();

  const handleClearDataSets = async () => {
    setIsClearing(true);

    try {
      // Clear the datasets from the store
      clearAllDataSets();

      // TODO: Add API call to clear datasets from backend if needed
      // await axios.delete(`${apiBase}/api/clear_training_datasets`);

      console.log("Training datasets cleared successfully");
    } catch (error) {
      console.error("Error clearing training datasets:", error);
    } finally {
      setIsClearing(false);
      setIsOpen(false);
    }
  };

  // Don't render if no datasets
  if (uploadedDataSets.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-center relative group">
      <div data-cy="open-clear-datasets-dialog" className="cursor-pointer">
        <Button
          targetId="ClearDatasetsIcon"
          buttonDescription="Clear all training datasets"
          Icon={Trash2}
          iconClassName="h-6 w-6 stroke-border-default stroke-1 hover:stroke-red-500 transition-colors duration-300"
          spanClassName="mt-2 left-1/2 -translate-x-1/2"
          onClick={() => setIsOpen(true)}
          aria-label="Clear all training datasets"
          className=""
          tooltipId="tooltip-clear-datasets"
        />
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsOpen(false)}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-overlay-default" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-surface-modal-margin border border-border-default p-6 text-left align-middle shadow-xl transition-all">
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/20 mb-4">
                      <Trash2 className="h-6 w-6 text-red-400" />
                    </div>

                    <h3 className="text-lg font-medium text-text-default mb-2">
                      Clear All Training Datasets
                    </h3>

                    <p className="text-sm text-gray-400 mb-6">
                      Are you sure you want to clear all training datasets? You
                      have {uploadedDataSets.length} dataset
                      {uploadedDataSets.length !== 1 ? "s" : ""} uploaded. This
                      action cannot be undone.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsOpen(false)}
                      disabled={isClearing}
                      className="flex-1 px-4 py-2 text-text-default bg-button-emphasis border border-border-default rounded-md hover:bg-button-hover-emphasis transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleClearDataSets}
                      disabled={isClearing}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {isClearing ? "Clearing..." : "Clear All"}
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
