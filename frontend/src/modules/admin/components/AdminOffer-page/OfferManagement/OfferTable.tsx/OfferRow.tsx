import React, { useState } from "react";
import { Offer } from "@/types/offer";
import { FiEdit, FiTrash, FiToggleLeft, FiToggleRight } from "react-icons/fi";

interface OfferRowProps {
  offer: Offer;
  toggleActive: (id: string, isActive: boolean) => void;
  openModal: (offer: Offer) => void;
  onDelete: (id: string) => Promise<void>;
}

export const OfferRow: React.FC<OfferRowProps> = ({
  offer,
  toggleActive,
  openModal,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this gaming offer?")) {
      setIsDeleting(true);
      try {
        await onDelete(offer._id);
      } catch (error) {
        console.error("Error deleting offer:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Format discount value based on type
  const formattedDiscount =
    offer.discountType === "percentage"
      ? `${offer.discountValue}%`
      : `$${offer.discountValue}`;

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
        {offer.title}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
          {offer.code}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-900/50">
          {offer.category}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
        {formattedDiscount}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span
          className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
            offer.isActive
              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-900/50"
              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/50"
          }`}
        >
          {offer.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleActive(offer._id, offer.isActive)}
            className={`p-1.5 rounded-full transition-colors ${
              offer.isActive
                ? "text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
                : "text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            }`}
            title={offer.isActive ? "Deactivate Offer" : "Activate Offer"}
          >
            {offer.isActive ? (
              <FiToggleRight size={20} />
            ) : (
              <FiToggleLeft size={20} />
            )}
          </button>

          <button
            onClick={() => openModal(offer)}
            className="p-1.5 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            title="Edit Offer"
          >
            <FiEdit size={16} />
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`p-1.5 rounded-full transition-colors ${
              isDeleting
                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : "text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
            }`}
            title="Delete Offer"
          >
            <FiTrash size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};
