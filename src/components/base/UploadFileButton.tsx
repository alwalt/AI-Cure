"use client";
import { useState, Fragment, useRef } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import FileUploader from "@/components/leftColumn/filesArea/FileUploader";
import { Upload } from "lucide-react";

import { Table, UploadedFile, UploadFileButtonProps } from "@/types/files";
import Button from "@/components/base/Button";

export default function UploadFileButton({
  onTablesUpdate,
  onFilesUpdate,
}: UploadFileButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null); // for testing with cy

  const handleTablesUpdate = (tables: Table[]) => {
    onTablesUpdate(tables);
    setIsOpen(false);
  };

  const handleFilesUpdate = (files: UploadedFile[]) => {
    onFilesUpdate(files);
  };

  return (
    <div className="flex items-center justify-center relative group">
      <div data-cy="open-upload-dialog" className="cursor-pointer">
        <Button
          targetId="ArrowUpTrayIcon"
          buttonDescription="Upload files"
          Icon={Upload}
          iconClassName="h-6 w-6 stroke-primaryWhite stroke-1 text-primaryBlack  hover:stroke-redFill transition-colors duration-300"
          spanClassName="mt-2 left-1/2 -translate-x-1/2"
          onClick={() => setIsOpen(true)}
          aria-label="Upload files button" // Accessible label for screen readers
          role="button" // Explicitly defines the role as a button (this is usually implied for <button> elements)
          className="focus:outline-none focus:ring-2 focus:ring-primaryWhite" // Focus ring for keyboard navigation
          tooltipId="tooltip-upload-files"
        />
        <input
          type="file"
          multiple
          // data-cy="file-input"
          ref={inputRef}
          className="hidden"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const fl = e.target.files;
            if (!fl) return;
            // Map FileList to your UploadedFile type
            const uploads = Array.from(fl).map((file) => ({
              name: file.name,
              type: file.name.split(".").pop() || "",
              dateCreated: new Date().toISOString(),
              size: file.size,
              file: file,
              selected: false,
            }));
            // Call the original callback to update state
            handleFilesUpdate(uploads);
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
