import React, { useState } from "react";
import { Offer } from "@/types/offer";
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";

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
    <tr className="hover:bg-purple-50 dark:hover:bg-gray-750 transition-colors">
      <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-medium">
        {offer.title}
      </td>
      <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-medium px-2.5 py-1 rounded">
          {offer.code}
        </span>
      </td>
      <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-1 rounded">
          {offer.category}
        </span>
      </td>
      <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium">
        {formattedDiscount}
      </td>
      <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            offer.isActive
              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
              : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
          }`}
        >
          {offer.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-3">
          <button
            onClick={() => toggleActive(offer._id, !offer.isActive)}
            className={`p-1 rounded-full ${
              offer.isActive
                ? "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                : "text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/20"
            }`}
            title={offer.isActive ? "Deactivate Offer" : "Activate Offer"}
          >
            {offer.isActive ? (
              <FaToggleOn size={18} />
            ) : (
              <FaToggleOff size={18} />
            )}
          </button>

          <button
            onClick={() => openModal(offer)}
            className="p-1 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="Edit Offer"
          >
            <FaEdit size={16} />
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`p-1 rounded-full ${
              isDeleting
                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            }`}
            title="Delete Offer"
          >
            <FaTrash size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};
