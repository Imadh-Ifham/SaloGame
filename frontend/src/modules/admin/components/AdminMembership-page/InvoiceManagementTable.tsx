import React, { useState, useEffect, useMemo } from "react";
import { FiDownload, FiFilter, FiSearch, FiX } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axiosInstance from "@/axios.config";
import { toast } from "react-hot-toast";
import SubscriptionInvoiceReport from "./SubscriptionInvoiceReport";

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
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);

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

  const handleDownloadInvoice = (subscription: Subscription) => {
    if (subscription.paymentStatus !== "completed") {
      toast.error("Only completed invoices can be downloaded");
      return;
    }

    setSelectedSubscription(subscription);
    setShowInvoice(true);
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
    setSelectedSubscription(null);
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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      {/* Invoice Modal */}
      {showInvoice && selectedSubscription && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black bg-opacity-75">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Invoice - {selectedSubscription.membershipId.name} Membership
              </h3>
              <button
                onClick={handleCloseInvoice}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="h-[calc(90vh-4rem)]">
              <SubscriptionInvoiceReport subscription={selectedSubscription} />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Invoice & Payment Management
        </h2>
        <div className="flex space-x-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center"
            >
              <FiFilter className="mr-2" />
              <span>Filter</span>
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-2 p-4 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-10 w-72 border border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-gray-900 dark:text-white font-semibold">
                    Filter Invoices
                  </h3>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    <FiX />
                  </button>
                </div>

                <div className="mb-3">
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <DatePicker
                    selected={startDate}
                    onChange={setStartDate}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md border border-gray-300 dark:border-gray-600"
                    placeholderText="Select start date"
                    dateFormat="MMM d, yyyy"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <DatePicker
                    selected={endDate}
                    onChange={setEndDate}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md border border-gray-300 dark:border-gray-600"
                    placeholderText="Select end date"
                    dateFormat="MMM d, yyyy"
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handleClearDateFilter}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
            <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm flex items-center border border-blue-200 dark:border-blue-900/50">
              <span>Status: {statusFilter}</span>
              <button
                onClick={() => setStatusFilter("all")}
                className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                <FiX size={14} />
              </button>
            </div>
          )}

          {startDate && (
            <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm flex items-center border border-blue-200 dark:border-blue-900/50">
              <span>From: {startDate.toLocaleDateString()}</span>
              <button
                onClick={() => setStartDate(null)}
                className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                <FiX size={14} />
              </button>
            </div>
          )}

          {endDate && (
            <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm flex items-center border border-blue-200 dark:border-blue-900/50">
              <span>To: {endDate.toLocaleDateString()}</span>
              <button
                onClick={() => setEndDate(null)}
                className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                <FiX size={14} />
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setStatusFilter("all");
              setStartDate(null);
              setEndDate(null);
            }}
            className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Invoice Table */}
      <div className="overflow-x-auto bg-white scrollbar-hide dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y scrollbar-hide divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Invoice ID
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                User Email
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Membership Type
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Amount
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Payment Status
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedSubscriptions.length > 0 ? (
              paginatedSubscriptions.map((subscription) => (
                <tr
                  key={subscription._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {subscription._id.substring(0, 8)}...
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {subscription.userId?.email || "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {subscription.membershipId?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    LKR {subscription.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusBadgeClass(
                        subscription.paymentStatus
                      )}`}
                    >
                      {subscription.paymentStatus.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(subscription.createdAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => handleDownloadInvoice(subscription)}
                      className="p-1.5 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      disabled={subscription.paymentStatus !== "completed"}
                      title={
                        subscription.paymentStatus !== "completed"
                          ? "Only completed invoices can be downloaded"
                          : "Download Invoice"
                      }
                    >
                      <FiDownload
                        size={16}
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
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
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
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {paginatedSubscriptions.length} of{" "}
            {filteredSubscriptions.length} invoices
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
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
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

export default InvoiceManagementTable;
