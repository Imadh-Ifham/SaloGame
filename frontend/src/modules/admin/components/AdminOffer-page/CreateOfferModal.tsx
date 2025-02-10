// src/modules/admin/components/AdminOffer-page/CreateOfferModal.tsx
import React from "react";
import Modal from "@/components/Modal";
import OfferForm from "./OfferForm";
import { useOffers } from "@/hooks/useOffers";

interface CreateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const CreateOfferModal: React.FC<CreateOfferModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const {
    membershipTypes,
    formData,
    error,
    handleInputChange,
    handleSubmit: submitOffer,
  } = useOffers();

  const handleSubmit = async () => {
    await submitOffer();
    onComplete();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Offer">
      <div className="p-6">
        <OfferForm
          formData={formData}
          membershipTypes={membershipTypes}
          handleInputChange={handleInputChange}
          error={error}
        />

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Create Offer
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateOfferModal;
