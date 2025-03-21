import React, { useState, useMemo } from "react";
import { FaUser, FaSyncAlt, FaExclamationCircle } from "react-icons/fa";

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
  const paginatedActivities = activities.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "new_subscription":
        return <FaUser className="text-green-500" />;
      case "auto_renewal":
        return <FaSyncAlt className="text-blue-500" />;
      case "expiring_membership":
        return <FaExclamationCircle className="text-red-500" />;
      default:
        return null;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "new_subscription":
        return "bg-green-100 text-green-800";
      case "auto_renewal":
        return "bg-blue-100 text-blue-800";
      case "expiring_membership":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-100">Recent Activity</h2>
      <ul className="space-y-4">
        {paginatedActivities.map((activity, index) => (
          <li
            key={index}
            className={`flex items-center p-4 rounded-lg ${getActivityColor(
              activity.type
            )}`}
          >
            <div className="mr-4">{getActivityIcon(activity.type)}</div>
            <div>
              <p className="text-sm font-medium">
                {activity.type === "new_subscription" && (
                  <>
                    <span className="font-bold">{activity.user.name}</span>{" "}
                    subscribed to{" "}
                    <span className="font-bold">
                      {activity.membership.name}
                    </span>
                  </>
                )}
                {activity.type === "auto_renewal" && (
                  <>
                    <span className="font-bold">{activity.user.name}</span>'s
                    membership{" "}
                    <span className="font-bold">
                      {activity.membership.name}
                    </span>{" "}
                    auto-renewed
                  </>
                )}
                {activity.type === "expiring_membership" && (
                  <>
                    <span className="font-bold">{activity.user.email}</span>'s
                    membership{" "}
                    <span className="font-bold">
                      {activity.membership.name}
                    </span>{" "}
                    is expiring soon
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(activity.date).toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
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

export default RecentActivityFeed;
