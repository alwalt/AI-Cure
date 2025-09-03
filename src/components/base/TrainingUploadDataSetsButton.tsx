"use client";
import { useState, Fragment, useRef } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import TrainingDataSetUploader from "@/components/trainingAi/TrainingDataSetUploader";
import { Upload } from "lucide-react";
import Button from "@/components/base/Button";

export default function TrainingUploadDataSetButton() {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null); // for testing with cy

  const handleUploadComplete = () => {
    setIsOpen(false);
  };

  return (
    <div className="flex items-center justify-center relative group">
      <div data-cy="open-dataset-upload-dialog" className="cursor-pointer">
        <Button
          targetId="UploadDatasetIcon"
          buttonDescription="Upload training datasets button"
          Icon={Upload}
          iconClassName="h-6 w-6 stroke-border-default stroke-1 hover:stroke-stroke-hover-red transition-colors duration-300"
          spanClassName="mt-2 left-1/2 -translate-x-1/2"
          onClick={() => setIsOpen(true)}
          aria-label="Upload training datasets button"
          className=""
          tooltipId="tooltip-upload-datasets"
        />
        <input
          type="file"
          multiple
          accept=".csv,.xlsx,.xls,.json,.jsonl,.txt,.tsv,.parquet,.h5,.hdf5,.sql,.xml"
          ref={inputRef}
          className="hidden"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            // This could be used for direct file input if needed
            // The TrainingDataSetUploader handles the actual upload logic
          }}
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
                  <TrainingDataSetUploader />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center items-center border border-border-default mt-4 px-4 py-2 hover:bg-button-hover-close bg-button-close transition-all hover:font-semibold duration-300 text-text-default rounded w-full"
                  >
                    Close
                  </button>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
