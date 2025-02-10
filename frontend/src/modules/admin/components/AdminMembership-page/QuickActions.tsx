// src/modules/admin/components/AdminMembership-page/QuickActions.tsx
import React from "react";
import { useState } from "react";
import { FaUserPlus, FaSync } from "react-icons/fa";
import AssignMembershipModal from "./AssignMembershipModal";
import RenewMembershipsModal from "./RenewMembershipModal";
import { useDispatch } from "react-redux";
import { fetchMembershipData } from "../../../../store/slices/membershipSlice";

function QuickActions() {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const dispatch = useDispatch();

  const handleAssignmentComplete = () => {
    // Refresh membership data in the redux store
    dispatch(fetchMembershipData());
  };

  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center transition-colors duration-200"
        onClick={() => setIsAssignModalOpen(true)}
      >
        <FaUserPlus className="mr-2" /> Assign Membership
      </button>
      <button
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center transition-colors duration-200"
        onClick={() => setIsRenewModalOpen(true)}
      >
        <FaSync className="mr-2" /> Renew Expiring Memberships
      </button>

      <AssignMembershipModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssignmentComplete={handleAssignmentComplete}
      />
      <RenewMembershipsModal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
      />
    </div>
  );
}

export default QuickActions;
