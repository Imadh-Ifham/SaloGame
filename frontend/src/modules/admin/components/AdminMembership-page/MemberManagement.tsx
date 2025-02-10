import { useState, useEffect, useMemo } from "react";
import { FaSearch, FaEye } from "react-icons/fa";
import MemberDetailsModal from "./MemberDetailsModal";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchMembers } from "../../../../store/slices/membershipSlice";

interface Member {
  _id: string;
  name: string;
  email: string;
  defaultMembershipId?: {
    _id: string;
    name: string;
  };
  role: string;
  subscription?: {
    startDate: string;
    endDate: string;
    status: string;
  };
}

function MemberManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { members, loading, error } = useSelector(
    (state: RootState) => state.membership
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMembers());
  }, [dispatch]);

  // Filter members based on Search term
  const filteredMembers = useMemo(() => {
    return members.filter((member) =>
      member?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [members, searchTerm]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Member Management</h2>

      {/* Search Bar */}
      <div className="flex items-center mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      )}

      {/* Error State */}
      {error && <div className="text-red-500 text-center py-4">{error}</div>}

      {/* Members Table */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Membership</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr key={member._id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{member.email}</td>
                    <td className="p-2">
                      {member.defaultMembershipId?.name || "N/A"}
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaEye className="inline mr-1" /> View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500">
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Member Details Modal */}
      <MemberDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        member={selectedMember}
        refreshMembers={() => dispatch(fetchMembers())}
      />
    </div>
  );
}

export default MemberManagement;
