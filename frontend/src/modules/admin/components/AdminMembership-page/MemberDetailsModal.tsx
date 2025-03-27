import React from "react";
import Modal from "@/components/Modal";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Member {
  _id: string;

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
}) => {
  if (!member) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Member Details">
      <div className="p-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <XMarkIcon className="w-6 h-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
        </button>

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
        </div>
      </div>
    </Modal>
  );
};

export default MemberDetailsModal;
