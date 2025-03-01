"use client";
// import FilesTable from "@/components/FilesTable";
import { useState, Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react"; // for a11y
import FileUploader from "@/components/FileUploader"; // Import the component

interface Table {
  csv_filename: string;
  display_name: string;
}

interface UploadFileButtonProps {
  onTablesUpdate: (tables: Table[]) => void;
  onSessionUpdate: (sessionId: string) => void;
}

export default function UploadFileButton({
  onTablesUpdate,
  onSessionUpdate,
}: UploadFileButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedTables, setUploadedTables] = useState<Table[]>([]);
  const [sessionId, setSessionId] = useState<string>("");

  // This function updates the uploaded tables after API call.
  const handleTablesUpdate = (tables: Table[]) => {
    console.log("UploadFileButton, Tables: ", tables);
    setUploadedTables(tables);
    onTablesUpdate(tables); // Call the parent function to update state in FilesManager
  };

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Upload File
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
          {/* Background Overlay */}
          <TransitionChild
            as={Fragment}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 bg-black"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
            />
          </TransitionChild>

          {/* ModalPanel */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="transition-transform duration-300 ease-out"
              enterFrom="scale-95 opacity-0"
              enterTo="scale-100 opacity-100"
              leave="transition-transform duration-200 ease-in"
              leaveFrom="scale-100 opacity-100"
              leaveTo="scale-95 opacity-0"
            >
              <DialogPanel
                className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg"
                as="div"
              >
                <FileUploader
                  onTablesUpdate={handleTablesUpdate}
                  onSessionUpdate={setSessionId}
                />{" "}
                {/* Render InsideCode inside the modal */}
                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
                >
                  Close
                </button>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
