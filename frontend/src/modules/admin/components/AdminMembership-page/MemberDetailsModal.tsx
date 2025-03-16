import React from "react";
import Modal from "@/components/Modal";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axiosInstance from "@/axios.config";

interface Member {
  _id: string;
  name: string;
  email: string;
  defaultMembershipId?: {
    _id: string;
    name: string;
  };
  subscription?: {
    startDate: string;
    endDate: string;
    status: string;
  };
}

interface MemberDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  refreshMembers: () => void;
}

const MemberDetailsModal: React.FC<MemberDetailsModalProps> = ({
  isOpen,
  onClose,
  member,
  refreshMembers,
}) => {
  if (!member) return null;

  const handleRenewMembership = async () => {
    try {
      await axiosInstance.post(`/subscriptions/${member._id}/renew`);
      refreshMembers();
      onClose();
    } catch (error) {
      console.error("Error renewing membership:", error);
    }
  };

  const handleCancelMembership = async () => {
    try {
      await axiosInstance.post(`/subscriptions/${member._id}/cancel`);
      refreshMembers();
      onClose();
    } catch (error) {
      console.error("Error canceling membership:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Member Details">
      <div className="p-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <XMarkIcon className="w-6 h-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
        </button>

        <h3 className="text-xl font-semibold mb-4">{member.name}</h3>
        <div className="space-y-4">
          <p>
            <span className="font-medium">Email:</span> {member.email}
          </p>
          <p>
            <span className="font-medium">Membership Type:</span>{" "}
            {member.defaultMembershipId?.name || "No active membership"}
          </p>
          {member.subscription && (
            <>
              <p>
                <span className="font-medium">Start Date:</span>{" "}
                {new Date(member.subscription.startDate).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Expiry Date:</span>{" "}
                {new Date(member.subscription.endDate).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                {member.subscription.status}
              </p>
            </>
          )}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleCancelMembership}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Cancel Membership
            </button>
            <button
              onClick={handleRenewMembership}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Renew Membership
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MemberDetailsModal;
