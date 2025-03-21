import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchMembers,
  deleteMembership,
  renewSubscription,
} from "@/store/slices/membershipSlice";
import { FaEye, FaSyncAlt, FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";

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

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<
    "all" | "active" | "expired" | "autoRenew"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 2;

  useEffect(() => {
    // Fetch user subscriptions using Redux action
    dispatch(fetchMembers());
  }, [dispatch]);

  // Filter and search logic
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

        // Log for debugging
        console.log(
          "Checking autoRenew for:",
          member.email,
          subscription.autoRenew
        );

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

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        Failed to load user subscriptions: {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-100">User Subscriptions</h2>
        <input
          type="text"
          placeholder="Search by email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 rounded bg-gray-700 text-gray-300"
        />
      </div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded ${
              filter === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-4 py-2 rounded ml-2 ${
              filter === "active"
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("expired")}
            className={`px-4 py-2 rounded ml-2 ${
              filter === "expired"
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            Expired
          </button>
          <button
            onClick={() => setFilter("autoRenew")}
            className={`px-4 py-2 rounded ml-2 ${
              filter === "autoRenew"
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            Auto Renew
          </button>
        </div>
      </div>
      <table className="w-full text-left text-gray-300">
        <thead>
          <tr className="bg-gray-700">
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Current Plan</th>
            <th className="px-4 py-2">Expiry Date</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedSubscriptions.map((member) => (
            <tr key={member._id} className="border-b border-gray-700">
              <td className="px-4 py-2">{member.email}</td>
              <td className="px-4 py-2">
                {member.defaultMembershipId?.name || "N/A"}
              </td>
              <td className="px-4 py-2">
                {member.subscription?.endDate
                  ? new Date(member.subscription.endDate).toLocaleDateString()
                  : "N/A"}
              </td>
              <td className="px-4 py-2 capitalize">
                {member.subscription?.status || "N/A"}
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => console.log("View subscription", member._id)}
                  className="text-blue-400 hover:text-blue-300 mr-2"
                >
                  <FaEye />
                </button>
                {member.subscription?.status === "active" ? (
                  <button
                    onClick={() => handleCancel(member.subscription?._id || "")}
                    className="text-red-400 hover:text-red-300"
                  >
                    <FaTimes />
                  </button>
                ) : (
                  <button
                    onClick={() => handleRenew(member.subscription?._id || "")}
                    className="text-green-400 hover:text-green-300"
                  >
                    <FaSyncAlt />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-300">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UserSubscriptionsTable;
