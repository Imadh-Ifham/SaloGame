import React from "react";

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({
  isOpen,
  onClose,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="bg-black bg-opacity-50 absolute inset-0"
        onClick={onClose}
      ></div>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full relative z-10 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-green-100 dark:bg-green-900 rounded-full p-3">
            <svg
              className="h-6 w-6 text-green-600 dark:text-green-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">
          Success!
        </h3>
        <p className="text-center text-gray-600 dark:text-gray-300">
          {message}
        </p>
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessDialog;
