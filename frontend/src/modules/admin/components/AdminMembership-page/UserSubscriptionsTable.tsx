import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchMembers,
  deleteMembership,
  renewSubscription,
} from "@/store/slices/membershipSlice";
import { FiSearch, FiEye, FiRefreshCw, FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";
import MemberDetailsModal from "./MemberDetailsModal";
interface Subscription {
  _id: string;
  startDate: string;
  endDate: string;
  status: string;
  autoRenew: boolean | { type: boolean };
}

interface Member {
  _id: string;
  email: string;
  defaultMembershipId?: {
    name: string;
  };
  subscription?: Subscription;
}

const UserSubscriptionsTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { members, loading, error } = useSelector(
    (state: RootState) => state.membership
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<
    "all" | "active" | "expired" | "autoRenew"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 3;

  useEffect(() => {
    // Fetch user subscriptions using Redux action
    dispatch(fetchMembers());
  }, [dispatch]);

  // Filter and search logic
  const filteredSubscriptions = useMemo(() => {
    let filtered = members.filter((member) => member.subscription) as Member[]; // Ensure only users with subscriptions are included

    if (filter === "active") {
      filtered = filtered.filter(
        (member) => member.subscription?.status === "active"
      );
    } else if (filter === "expired") {
      filtered = filtered.filter(
        (member) => member.subscription?.status === "expired"
      );
    } else if (filter === "autoRenew") {
      filtered = filtered.filter((member) => {
        const subscription = member.subscription;
        if (!subscription) return false;

        // Check both possible formats
        if (typeof subscription.autoRenew === "boolean") {
          return subscription.autoRenew === true;
        }

        if (
          subscription.autoRenew &&
          typeof subscription.autoRenew === "object"
        ) {
          if ("type" in subscription.autoRenew) {
            return subscription.autoRenew.type === true;
          }
        }

        return false;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter((member) =>
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [members, filter, searchTerm]);

  const totalPages = Math.ceil(filteredSubscriptions.length / rowsPerPage);
  const paginatedSubscriptions = filteredSubscriptions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleViewDetails = (member: Member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleCancel = async (subscriptionId: string) => {
    try {
      await dispatch(deleteMembership(subscriptionId)).unwrap();
      toast.success("Subscription canceled successfully.");
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel subscription.");
    }
  };

  const handleRenew = async (subscriptionId: string) => {
    try {
      await dispatch(renewSubscription(subscriptionId)).unwrap();
      toast.success("Subscription renewed successfully.");
    } catch (error: any) {
      toast.error(error.message || "Failed to renew subscription.");
    }
  };

  // Get status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
      case "expired":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg">
        Failed to load user subscriptions: {error}
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="mb-6 space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === "all"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === "active"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter("expired")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === "expired"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Expired
            </button>
            <button
              onClick={() => setFilter("autoRenew")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === "autoRenew"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Auto-Renew
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Current Plan
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Expiry Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedSubscriptions.length > 0 ? (
              paginatedSubscriptions.map((member) => (
                <tr
                  key={member._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {member.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {member.defaultMembershipId?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {member.subscription?.endDate
                      ? new Date(
                          member.subscription.endDate
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusBadgeClass(
                        member.subscription?.status || ""
                      )}`}
                    >
                      {member.subscription?.status?.toUpperCase() || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(member)}
                        className="p-1.5 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        title="View Details"
                      >
                        <FiEye size={16} />
                      </button>
                      {member.subscription?.status === "active" ? (
                        <button
                          onClick={() =>
                            handleCancel(member.subscription?._id || "")
                          }
                          className="p-1.5 rounded-full text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          title="Cancel Subscription"
                        >
                          <FiX size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleRenew(member.subscription?._id || "")
                          }
                          className="p-1.5 rounded-full text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                          title="Renew Subscription"
                        >
                          <FiRefreshCw size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No subscriptions found with the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <MemberDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          member={selectedMember}
          refreshMembers={() => dispatch(fetchMembers())}
        />
      )}

      {/* Pagination Controls */}
      {paginatedSubscriptions.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {Math.min(rowsPerPage, paginatedSubscriptions.length)} of{" "}
            {filteredSubscriptions.length} subscriptions
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600">
              Page {currentPage} of {totalPages || 1}
            </div>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSubscriptionsTable;
