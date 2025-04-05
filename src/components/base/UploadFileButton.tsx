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
import { Table, UploadedFile, UploadFileButtonProps } from "@/types/files";
import Button from "@/components/base/Button";

export default function UploadFileButton({
  onTablesUpdate,
  onFilesUpdate,
}: UploadFileButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTablesUpdate = (tables: Table[]) => {
    onTablesUpdate(tables);
    setIsOpen(false);
  };

  const handleFilesUpdate = (files: UploadedFile[]) => {
    onFilesUpdate(files);
  };

  return (
    <div className="flex items-center justify-center relative group">
      <Button
        targetId="ArrowUpTrayIcon"
        buttonDescription="Upload Files"
        Icon={ArrowUpTrayIcon}
        iconClassName="h-6 w-6"
        spanClassName="mt-2"
        onClick={() => setIsOpen(true)}
      />

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
            <div className="fixed inset-0 bg-black bg-opacity-70" />
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
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-grey border border-primaryWhite p-6 text-left align-middle shadow-xl transition-all">
                  <FileUploader
                    onTablesUpdate={handleTablesUpdate}
                    onFilesUpdate={handleFilesUpdate}
                  />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center items-center border border-primaryWhite mt-4 px-4 py-2 hover:bg-red-600 bg-redFill hover:redBorder transition-colors duration-300 text-white rounded"
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
