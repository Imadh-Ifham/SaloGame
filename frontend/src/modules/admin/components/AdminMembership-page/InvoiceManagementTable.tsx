import React, { useState, useEffect, useMemo } from "react";
import { FaDownload, FaFilter, FaSearch, FaTimes } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axiosInstance from "@/axios.config";
import { toast } from "react-hot-toast";

// Define subscription interface to match backend structure
interface Subscription {
  _id: string;
  userId: {
    _id: string;
    email: string;
    name?: string;
  };
  membershipId: {
    _id: string;
    name: string;
    price: number;
  };
  startDate: string;
  endDate: string;
  duration: number;
  totalAmount: number;
  status: "active" | "expired" | "cancelled";
  paymentStatus: "pending" | "completed" | "failed";
  autoRenew: boolean;
  createdAt: string;
}

const InvoiceManagementTable: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "completed" | "failed"
  >("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        // Build query parameters for filtering by date
        const params = new URLSearchParams();

        if (startDate) {
          const startOfDay = new Date(startDate);
          startOfDay.setHours(0, 0, 0, 0);
          params.append("startDate", startOfDay.toISOString());
        }

        if (endDate) {
          const endOfDay = new Date(endDate);
          endOfDay.setHours(23, 59, 59, 999);
          params.append("endDate", endOfDay.toISOString());
        }

        // Alternative approach using the members endpoint
        const response = await axiosInstance.get("/users");
        const members = response.data || [];

        // Extract subscription data from members
        // Extract subscription data from members
        const subscriptionsData = members
          .filter((member) => member.subscription)
          .map((member) => {
            // Get the membership details
            const membershipDetails = member.defaultMembershipId || {
              _id: "unknown",
              name: "Unknown Membership",
              price: 0,
            };

            // Debug the subscription data structure
            console.log("Subscription data for debug:", {
              email: member.email,
              subscription: member.subscription,
              totalAmount: member.subscription.totalAmount,
            });

            // Use the proper price - either from subscription or from membership
            const amount =
              member.subscription.totalAmount ||
              membershipDetails.price * member.subscription.duration;

            // Use the proper payment status with fallback options
            const payStatus =
              member.subscription?.paymentStatus ||
              (member.subscription?.status === "active"
                ? "completed"
                : "pending");

            return {
              _id: member.subscription._id,
              userId: {
                _id: member._id,
                email: member.email,
                name: member.name,
              },
              membershipId: membershipDetails,
              totalAmount: amount,
              paymentStatus: payStatus,
              createdAt:
                member.subscription?.startDate || new Date().toISOString(),
              startDate: member.subscription?.startDate || "",
              endDate: member.subscription?.endDate || "",
              duration: member.subscription?.duration || 1,
              status: member.subscription?.status || "active",
              autoRenew: member.subscription?.autoRenew || false,
            };
          });

        setSubscriptions(subscriptionsData);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to fetch subscription invoices"
        );
        toast.error("Failed to fetch subscription invoices");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [startDate, endDate]);

  const handleDownloadInvoice = async (subscriptionId: string) => {
    try {
      // This would need a proper invoice PDF generation endpoint
      // For now we'll just show a message
      toast.success("Invoice download functionality requires backend support");

      /* Uncomment this when you have the proper backend endpoint
      const response = await axiosInstance.get(
        `/subscriptions/${subscriptionId}/invoice/download`,
        {
          responseType: "blob",
        }
      );

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${subscriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      */
    } catch (error) {
      toast.error("Failed to download invoice");
    }
  };

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((subscription) => {
      // Search term filter
      const matchesSearch =
        subscription.userId?.email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        "" ||
        subscription._id.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" || subscription.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, searchTerm, statusFilter]);

  const paginatedSubscriptions = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredSubscriptions.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredSubscriptions, currentPage]);

  const totalPages = Math.ceil(filteredSubscriptions.length / rowsPerPage);

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

  const handleClearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="text-center text-red-500 py-8">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-100">
          Invoice & Payment Management
        </h2>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="px-4 py-2 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 hover:bg-gray-600 flex items-center"
            >
              <FaFilter className="mr-2" />
              <span>Filter</span>
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-2 p-4 bg-gray-700 rounded-lg shadow-lg z-10 w-72">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-gray-100 font-semibold">
                    Filter Invoices
                  </h3>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="mb-3">
                  <label className="block text-gray-300 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-800 text-gray-100 rounded-md border border-gray-600"
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="block text-gray-300 mb-1">Start Date</label>
                  <DatePicker
                    selected={startDate}
                    onChange={setStartDate}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    className="w-full px-3 py-2 bg-gray-800 text-gray-100 rounded-md border border-gray-600"
                    placeholderText="Select start date"
                    dateFormat="MMM d, yyyy"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-300 mb-1">End Date</label>
                  <DatePicker
                    selected={endDate}
                    onChange={setEndDate}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    className="w-full px-3 py-2 bg-gray-800 text-gray-100 rounded-md border border-gray-600"
                    placeholderText="Select end date"
                    dateFormat="MMM d, yyyy"
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handleClearDateFilter}
                    className="px-3 py-1 bg-gray-600 text-gray-200 rounded hover:bg-gray-500"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(statusFilter !== "all" || startDate || endDate) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {statusFilter !== "all" && (
            <div className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm flex items-center">
              <span>Status: {statusFilter}</span>
              <button
                onClick={() => setStatusFilter("all")}
                className="ml-2 text-blue-300 hover:text-blue-100"
              >
                <FaTimes size={12} />
              </button>
            </div>
          )}

          {startDate && (
            <div className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm flex items-center">
              <span>From: {startDate.toLocaleDateString()}</span>
              <button
                onClick={() => setStartDate(null)}
                className="ml-2 text-blue-300 hover:text-blue-100"
              >
                <FaTimes size={12} />
              </button>
            </div>
          )}

          {endDate && (
            <div className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm flex items-center">
              <span>To: {endDate.toLocaleDateString()}</span>
              <button
                onClick={() => setEndDate(null)}
                className="ml-2 text-blue-300 hover:text-blue-100"
              >
                <FaTimes size={12} />
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setStatusFilter("all");
              setStartDate(null);
              setEndDate(null);
            }}
            className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Invoice Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-gray-300">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-4 py-3">Invoice ID</th>
              <th className="px-4 py-3">User Email</th>
              <th className="px-4 py-3">Membership Type</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Payment Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {paginatedSubscriptions.length > 0 ? (
              paginatedSubscriptions.map((subscription) => (
                <tr key={subscription._id} className="hover:bg-gray-700/50">
                  <td className="px-4 py-3 font-mono text-gray-400">
                    {subscription._id.substring(0, 8)}...
                  </td>
                  <td className="px-4 py-3">
                    {subscription.userId?.email || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    {subscription.membershipId?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    LKR {subscription.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs ${getStatusBadgeClass(
                        subscription.paymentStatus
                      )}`}
                    >
                      {subscription.paymentStatus.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {formatDate(subscription.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDownloadInvoice(subscription._id)}
                      className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
                      disabled={subscription.paymentStatus !== "completed"}
                      title={
                        subscription.paymentStatus !== "completed"
                          ? "Only completed invoices can be downloaded"
                          : "Download Invoice"
                      }
                    >
                      <FaDownload
                        className={
                          subscription.paymentStatus !== "completed"
                            ? "opacity-50"
                            : ""
                        }
                      />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                  No invoices found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredSubscriptions.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-gray-400 text-sm">
            Showing {paginatedSubscriptions.length} of{" "}
            {filteredSubscriptions.length} invoices
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="px-4 py-2 bg-gray-700 text-gray-300 rounded">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManagementTable;
