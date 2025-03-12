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
import { useSessionFileStore } from "@/store/useSessionFileStore";
import { Table, UploadedFile } from "@/types/files";

interface UploadFileButtonProps {
  onTablesUpdate: (tables: Table[]) => void;
  onSessionUpdate: (sessionId: string) => void;
  onFilesUpdate: (files: UploadedFile[]) => void;
}

export default function UploadFileButton({
  onTablesUpdate,
  onSessionUpdate,
  onFilesUpdate,
}: UploadFileButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const setSessionId = useSessionFileStore((state) => state.setSessionId);

  const handleTablesUpdate = (tables: Table[]) => {
    onTablesUpdate(tables);
    setIsOpen(false);
  };

  const handleSessionUpdate = (newSessionId: string) => {
    setSessionId(newSessionId);
    onSessionUpdate(newSessionId);
  };

  const handleFilesUpdate = (files: UploadedFile[]) => {
    onFilesUpdate(files);
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
            <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <FileUploader
                    onTablesUpdate={handleTablesUpdate}
                    onSessionUpdate={handleSessionUpdate}
                    onFilesUpdate={handleFilesUpdate}
                  />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
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
