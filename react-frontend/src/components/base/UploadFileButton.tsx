"use client";
import { useState, Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import FileUploader from "@/components/FileUploader";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

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

  const handleTablesUpdate = (tables: Table[]) => {
    console.log("UploadFileButton, Tables: ", tables);
    setUploadedTables(tables);
    onTablesUpdate(tables);
  };

  const handleSessionUpdate = (newSessionID: string) => {
    console.log("UploadFileButton, SessionID: ", newSessionID)
    setSessionId(newSessionID);
    onSessionUpdate(newSessionID);
  };

  return (
    <div className="flex items-center justify-center relative group">
      <button onClick={() => setIsOpen(true)} className="text-white rounded">
        <ArrowUpTrayIcon className="h-6 w-6 stroke-primaryWhite stroke-1 text-primaryBlack hover:stroke-redFill transition-colors duration-300" />
      </button>
      <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-primaryBlack border-primaryWhite border text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 px-2 py-1">
        Upload file
      </span>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
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
                  onSessionUpdate={handleSessionUpdate}
                />
                <button
                  onClick={() => {
                    // Make sure session ID is passed to parent before closing
                    if (sessionId) {
                      console.log("Modal closing, ensuring session ID is passed:", sessionId);
                      onSessionUpdate(sessionId);
                    }
                    setIsOpen(false);
                  }}
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
