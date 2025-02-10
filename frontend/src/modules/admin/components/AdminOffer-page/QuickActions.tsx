// QuickActions.tsx
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
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center transition-colors duration-200"
        onClick={() => setIsCreateModalOpen(true)}
      >
        <FaPlus className="mr-2" /> Create New Offer
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
