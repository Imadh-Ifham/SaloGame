import React, { useState, useEffect } from "react";
import { FiRefreshCw, FiAlertCircle, FiSearch } from "react-icons/fi";
import axiosInstance from "@/axios.config";
import { toast } from "react-hot-toast";

interface FailedRenewal {
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
  endDate: string;
  renewalFailureReason: string;
  lastRenewalAttempt: string;
}

const FailedRenewalsTable: React.FC = () => {
  const [failedRenewals, setFailedRenewals] = useState<FailedRenewal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const fetchFailedRenewals = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        "/subscriptions/failed-renewals"
      );
      setFailedRenewals(response.data.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to fetch failed renewals"
      );
      toast.error("Failed to fetch failed renewals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFailedRenewals();
  }, []);

  const handleManualRenewal = async (subscriptionId: string) => {
    try {
      setLoading(true);
      await axiosInstance.post("/subscriptions/manual-renew", {
        subscriptionId,
      });
      toast.success("Subscription manually renewed successfully");
      // Refresh the data
      fetchFailedRenewals();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to renew subscription"
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter and pagination logic
  const filteredRenewals = failedRenewals.filter(
    (renewal) =>
      renewal.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      renewal.membershipId.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRenewals.length / rowsPerPage);
  const paginatedRenewals = filteredRenewals.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Failed Auto-Renewals
        </h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search by email or membership..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>

      {paginatedRenewals.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <FiAlertCircle className="mx-auto mb-2 h-8 w-8" />
          <p>No failed renewals found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    User
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
                    Expired On
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Last Attempt
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Failure Reason
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
                {paginatedRenewals.map((renewal) => (
                  <tr
                    key={renewal._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {renewal.userId.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {renewal.membershipId.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {new Date(renewal.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {new Date(renewal.lastRenewalAttempt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400">
                      {renewal.renewalFailureReason}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => handleManualRenewal(renewal._id)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        <FiRefreshCw className="mr-1" />
                        Renew
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredRenewals.length > rowsPerPage && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {paginatedRenewals.length} of {filteredRenewals.length}{" "}
                failed renewals
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FailedRenewalsTable;
