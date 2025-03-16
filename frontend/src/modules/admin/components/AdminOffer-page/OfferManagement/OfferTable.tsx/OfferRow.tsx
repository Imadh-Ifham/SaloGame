import React from "react";
import { FaToggleOn, FaToggleOff, FaEdit, FaTrash } from "react-icons/fa";
import { Offer } from "@/types/offer";

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
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      try {
        await onDelete(offer._id);
      } catch (error) {
        console.error("Error deleting offer:", error);
      }
    }
  };

  return (
    <tr key={offer._id} className="hover:bg-gray-50">
      <td className="px-6 py-4 border-b">{offer.title}</td>
      <td className="px-6 py-4 border-b">{offer.code}</td>
      <td className="px-6 py-4 border-b capitalize">{offer.category}</td>
      <td className="px-6 py-4 border-b">
        {offer.discountType === "percentage"
          ? `${offer.discountValue}%`
          : `$${offer.discountValue}`}
      </td>
      <td className="px-6 py-4 border-b">
        <button
          onClick={() => toggleActive(offer._id, offer.isActive)}
          className={`text-xl ${
            offer.isActive ? "text-green-500" : "text-gray-400"
          }`}
        >
          {offer.isActive ? <FaToggleOn /> : <FaToggleOff />}
        </button>
      </td>
      <td className="px-6 py-4 border-b">
        <div className="flex space-x-2">
          <button
            onClick={() => openModal(offer)}
            className="text-blue-500 hover:text-blue-600"
          >
            <FaEdit />
          </button>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-600"
          >
            <FaTrash />
          </button>
        </div>
      </td>
    </tr>
  );
};
