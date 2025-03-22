import React, { useState } from "react";
import { FaPlus, FaSync } from "react-icons/fa";
import CreateOfferModal from "./CreateOfferModal";
import { useDispatch } from "react-redux";
import { fetchOfferData } from "@/store/slices/offerSlice";

const QuickActions = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const dispatch = useDispatch();

  const handleOfferComplete = () => {
    dispatch(fetchOfferData());
  };

  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <button
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg flex items-center transition-colors duration-200 shadow-md hover:shadow-lg"
        onClick={() => setIsCreateModalOpen(true)}
      >
        <FaPlus className="mr-2" /> New Gaming Promotion
      </button>

      <button
        className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 px-6 rounded-lg flex items-center transition-colors duration-200 shadow-md hover:shadow-lg"
        onClick={() => dispatch(fetchOfferData())}
      >
        <FaSync className="mr-2" /> Refresh Data
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
