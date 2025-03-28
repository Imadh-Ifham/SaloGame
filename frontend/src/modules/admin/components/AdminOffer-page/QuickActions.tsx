import React, { useState } from "react";
import { FiPlus, FiRefreshCw } from "react-icons/fi";
import CreateOfferModal from "./CreateOfferModal";
import { useDispatch } from "react-redux";
import { fetchOfferData } from "@/store/slices/offerSlice";

const QuickActions: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const dispatch = useDispatch();

  const handleOfferComplete = () => {
    dispatch(fetchOfferData());
  };

  return (
    <div className="flex flex-wrap gap-4">
      <button
        className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow"
        onClick={() => setIsCreateModalOpen(true)}
      >
        <FiPlus className="mr-2" />
        New Gaming Promotion
      </button>

      <button
        className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow border border-gray-200 dark:border-gray-600"
        onClick={() => dispatch(fetchOfferData())}
      >
        <FiRefreshCw className="mr-2" />
        Refresh Data
      </button>

      <CreateOfferModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onComplete={handleOfferComplete}
      />
    </div>
  );
};

export default QuickActions;
