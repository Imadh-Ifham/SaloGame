import { useState, useEffect, useMemo } from "react";
import {
  FaSearch,
  FaEye,
  FaUserNinja,
  FaSteam,
  FaDiscord,
} from "react-icons/fa";
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
  // Added for gaming-specific fields
  gamerTag?: string;
  platform?: string;
  hoursPlayed?: number;
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
    if (members.length === 0) {
      // Sample data for display purposes
      return [
        {
          _id: "1",
          name: "Alex Gaming",
          email: "alex@gamercafe.com",
          gamerTag: "NinjaSniper42",
          platform: "PC Master Race",
          hoursPlayed: 156,
          defaultMembershipId: {
            _id: "2",
            name: "Pro Gamer",
          },
          role: "member",
          subscription: {
            startDate: "2024-12-15",
            endDate: "2025-03-15",
            status: "active",
          },
        },
        {
          _id: "2",
          name: "Sam Thompson",
          email: "sam@gamercafe.com",
          gamerTag: "FragMaster",
          platform: "PlayStation",
          hoursPlayed: 89,
          defaultMembershipId: {
            _id: "1",
            name: "Casual Gamer",
          },
          role: "member",
          subscription: {
            startDate: "2025-01-20",
            endDate: "2025-04-20",
            status: "active",
          },
        },
        {
          _id: "3",
          name: "Taylor Rodriguez",
          email: "taylor@gamercafe.com",
          gamerTag: "EliteStriker",
          platform: "Xbox",
          hoursPlayed: 204,
          defaultMembershipId: {
            _id: "3",
            name: "Elite Gamer",
          },
          role: "member",
          subscription: {
            startDate: "2024-11-05",
            endDate: "2025-05-05",
            status: "active",
          },
        },
      ].filter(
        (member) =>
          member?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member?.gamerTag?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return members.filter((member) =>
      member?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [members, searchTerm]);

  // Function to get platform icon
  const getPlatformIcon = (platform) => {
    if (!platform) return null;
    const lowercasePlatform = platform.toLowerCase();
    if (lowercasePlatform.includes("pc")) {
      return <FaSteam className="text-blue-400" />;
    } else if (lowercasePlatform.includes("playstation")) {
      return <FaDiscord className="text-indigo-400" />;
    } else {
      return <FaUserNinja className="text-green-400" />;
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <FaUserNinja className="mr-2 text-purple-500" />
        Gamer Profiles
      </h2>

      {/* Search Bar */}
      <div className="flex items-center mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search gamers by email or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 w-full bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-200"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        </div>
      )}

      {/* Error State */}
      {error && <div className="text-red-500 text-center py-4">{error}</div>}

      {/* Members Table */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-700">
                <th className="p-3 text-left text-gray-300">Gamer</th>
                <th className="p-3 text-left text-gray-300">Platform</th>
                <th className="p-3 text-left text-gray-300">Membership Tier</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr
                    key={member._id}
                    className="border-b border-gray-700 hover:bg-gray-850"
                  >
                    <td className="p-3">
                      <div>
                        <p className="text-sm text-gray-400">{member.email}</p>
                      </div>
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          member.defaultMembershipId?.name
                            ?.toLowerCase()
                            .includes("elite")
                            ? "bg-purple-900 text-purple-200"
                            : member.defaultMembershipId?.name
                                ?.toLowerCase()
                                .includes("pro")
                            ? "bg-blue-900 text-blue-200"
                            : "bg-green-900 text-green-200"
                        }`}
                      >
                        {member.defaultMembershipId?.name || "No Tier"}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setIsModalOpen(true);
                        }}
                        className="text-purple-400 hover:text-purple-300 bg-gray-900 px-3 py-1 rounded-lg flex items-center transition-colors duration-200"
                      >
                        <FaEye className="mr-1" /> Profile
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    No gamers found
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
