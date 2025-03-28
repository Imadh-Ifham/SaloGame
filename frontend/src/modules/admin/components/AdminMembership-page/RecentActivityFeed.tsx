import React, { useState, useMemo } from "react";
import { FiUser, FiRefreshCw, FiAlertCircle } from "react-icons/fi";

interface Activity {
  type: "new_subscription" | "auto_renewal" | "expiring_membership";
  user: { name: string; email: string };
  membership: { name: string };
  date: string;
}

interface RecentActivityFeedProps {
  activities: Activity[];
}

const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities = [],
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 4;

  // Sort activities by date (newest first)
  const sortedActivities = useMemo(() => {
    return [...activities].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [activities]);

  const totalPages = Math.ceil(activities.length / rowsPerPage);
  const paginatedActivities = sortedActivities.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "new_subscription":
        return <FiUser className="text-emerald-600 dark:text-emerald-400" />;
      case "auto_renewal":
        return <FiRefreshCw className="text-blue-600 dark:text-blue-400" />;
      case "expiring_membership":
        return <FiAlertCircle className="text-red-600 dark:text-red-400" />;
      default:
        return null;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "new_subscription":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50";
      case "auto_renewal":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50";
      case "expiring_membership":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-700";
    }
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

  // Format date in a consistent way
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h2>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <FiAlertCircle size={24} className="mb-2" />
          <p>No recent activities found</p>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {paginatedActivities.map((activity, index) => (
              <li
                key={index}
                className={`flex items-start p-3 rounded-lg transition-colors ${getActivityColor(
                  activity.type
                )}`}
              >
                <div className="p-2 rounded-full bg-white dark:bg-gray-700 mr-3">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {activity.type === "new_subscription" && (
                      <>
                        <span className="font-bold">
                          {activity.user.name || activity.user.email}
                        </span>{" "}
                        subscribed to{" "}
                        <span className="font-bold">
                          {activity.membership.name}
                        </span>
                      </>
                    )}
                    {activity.type === "auto_renewal" && (
                      <>
                        <span className="font-bold">
                          {activity.user.name || activity.user.email}
                        </span>
                        's membership{" "}
                        <span className="font-bold">
                          {activity.membership.name}
                        </span>{" "}
                        auto-renewed
                      </>
                    )}
                    {activity.type === "expiring_membership" && (
                      <>
                        <span className="font-bold">
                          {activity.user.name || activity.user.email}
                        </span>
                        's membership{" "}
                        <span className="font-bold">
                          {activity.membership.name}
                        </span>{" "}
                        is expiring soon
                      </>
                    )}
                  </p>
                  <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                    {formatDate(activity.date)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 text-sm">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecentActivityFeed;
