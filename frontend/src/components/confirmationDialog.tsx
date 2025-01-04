import React, { Fragment } from "react";
import {
  Dialog,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText: string;
  cancelButtonText: string;
  confirmButtonClassName?: string;
  cancelButtonClassName?: string;
  // Optional: Additional content such as error messages
  children?: React.ReactNode;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText,
  cancelButtonText,
  confirmButtonClassName = "bg-red-600 hover:bg-red-700",
  cancelButtonClassName = "bg-gray-300 hover:bg-gray-400",
  children,
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-20 overflow-y-auto"
        onClose={onClose}
      >
        <div className="min-h-screen px-4 text-center">
          {/* Overlay */}
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </TransitionChild>

          {/* Trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>

          {/* Modal Content */}
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
              <DialogTitle
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
              >
                {title}
              </DialogTitle>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {message}
                </p>
                {/* Optional: Render additional content like error messages */}
                {children}
              </div>

              <div className="mt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onConfirm}
                  className={`px-4 py-2 text-white rounded-md shadow ${confirmButtonClassName}`}
                >
                  {confirmButtonText}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 text-gray-700 rounded-md shadow ${cancelButtonClassName}`}
                >
                  {cancelButtonText}
                </button>
              </div>
            </div>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmationDialog;
