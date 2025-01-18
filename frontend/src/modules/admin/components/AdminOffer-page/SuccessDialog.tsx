import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { SuccessDialogProps } from "../../../../types/offer";

const SuccessDialog: React.FC<SuccessDialogProps> = ({
  isOpen,
  onClose,
  message,
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={onClose}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog
              className="fixed inset-0 bg-black bg-opacity-30"
              onClose={onClose}
            />
          </Transition.Child>

          <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
            <div className="flex items-center justify-center mb-4">
              <CheckCircleIcon className="h-12 w-12 text-primary" />
            </div>
            <Dialog.Title className="text-lg font-medium text-center leading-6 text-gray-900 dark:text-white">
              Success
            </Dialog.Title>
            <div className="mt-2">
              <p className="text-sm text-center text-gray-500 dark:text-gray-300">
                {message}
              </p>
            </div>
            <div className="mt-4 flex justify-center">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-primary text-white rounded-md shadow hover:bg-primary-dark"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SuccessDialog;
