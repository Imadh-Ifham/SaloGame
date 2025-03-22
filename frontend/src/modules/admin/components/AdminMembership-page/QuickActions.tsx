import React from "react";
import { useState } from "react";
import { FaUserPlus, FaSync, FaGamepad, FaCalendarPlus } from "react-icons/fa";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
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
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-yellow-500 mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <GiPerspectiveDiceSixFacesRandom className="mr-2 text-yellow-500" />
        Quick Actions
      </h2>
      <div className="flex flex-wrap gap-4">
        <button
          className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-3 px-6 rounded-lg flex items-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          onClick={() => setIsAssignModalOpen(true)}
        >
          <FaUserPlus className="mr-2" /> Assign Membership
        </button>
        <button
          className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-bold py-3 px-6 rounded-lg flex items-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          onClick={() => setIsRenewModalOpen(true)}
        >
          <FaSync className="mr-2" /> Renew Memberships
        </button>
        <button className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold py-3 px-6 rounded-lg flex items-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
          <FaGamepad className="mr-2" /> Create Tournament
        </button>
        <button className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold py-3 px-6 rounded-lg flex items-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
          <FaCalendarPlus className="mr-2" /> Schedule Event
        </button>
      </div>

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