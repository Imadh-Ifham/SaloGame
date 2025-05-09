import React from "react";
import { FiX } from "react-icons/fi";
import MembershipReport from "./MembershipReport";

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: any;
  selectedSections: string[];
  periodLabel: string;
}

const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  isOpen,
  onClose,
  reportData,
  selectedSections,
  periodLabel,
}) => {
  const [isLoading, setIsLoading] = React.useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black bg-opacity-75">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Membership Report Preview
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="flex-grow overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100/80 dark:bg-gray-900/80">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <span className="ml-3 text-gray-700 dark:text-gray-300">
                Loading preview...
              </span>
            </div>
          )}

          <MembershipReport
            reportData={reportData}
            selectedSections={selectedSections}
            periodLabel={periodLabel}
            onLoadComplete={() => setIsLoading(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default ReportPreviewModal;
