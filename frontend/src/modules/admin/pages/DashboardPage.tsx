import React, { useState, useEffect } from "react";
import axiosInstance from "../../../axios.config";
import { useAuth } from "../../../hooks/useAuth";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";

interface User {
  _id: string;
  email: string;
  role: "user" | "manager" | "owner";
}

interface AnalyticsData {
  labels: string[];
  values: number[];
}

const DashboardPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Analytics states
  const [userActivity, setUserActivity] = useState<AnalyticsData>({ labels: [], values: [] });
  const [topActions, setTopActions] = useState<AnalyticsData>({ labels: [], values: [] });

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/users");
      setUsers(response.data as User[]);
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    try {
      // Fetch user activity data from backend analytics route
      const activityRes = await axiosInstance.get<AnalyticsData>("/analytics/ga4/userActivity");
      if (activityRes.data) {
        setUserActivity(activityRes.data);
      }
      // Fetch top actions data from backend analytics route
      const actionsRes = await axiosInstance.get<AnalyticsData>("/analytics/ga4/top-actions");
      if (actionsRes.data) {
        setTopActions(actionsRes.data);
      }
    } catch (err) {
      console.error("Error fetching analytics data", err);
      setError("Failed to fetch analytics data");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await axiosInstance.put(`/users/${userId}`, updates);
      fetchUsers();
      setEditingUser(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await axiosInstance.delete(`/users/${userId}`);
      fetchUsers();
      setUserToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        {/* Existing User Management Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary dark:text-white">
            User Management
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Existing User Management Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-200">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.role === "owner"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "manager"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {(currentUser?.role === "owner" ||
                      (currentUser?.role === "manager" && user.role === "user")) && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Edit
                        </button>
                        {currentUser?.role === "owner" &&
                          user.role !== "owner" && (
                            <button
                              onClick={() => {
                                setUserToDelete(user);
                                setIsDeleteModalOpen(true);
                              }}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Google Analytics Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-primary dark:text-white mb-4">
            Google Analytics Data
          </h2>
          {analyticsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Activity - Line Chart */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">
                  User Activity
                </h3>
                <Line
                  data={{
                    labels: userActivity.labels,
                    datasets: [
                      {
                        label: "Active Users",
                        data: userActivity.values,
                        fill: false,
                        borderColor: "rgba(75,192,192,1)",
                      },
                    ],
                  }}
                  options={{ responsive: true, scales: { y: { beginAtZero: true } } }}
                />
              </div>

              {/* Top Actions - Bar Chart */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">
                  Top Actions
                </h3>
                <Bar
                  data={{
                    labels: topActions.labels,
                    datasets: [
                      {
                        label: "Event Count",
                        data: topActions.values,
                        backgroundColor: "rgba(54, 162, 235, 0.6)",
                      },
                    ],
                  }}
                  options={{ responsive: true, scales: { y: { beginAtZero: true } } }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Edit User
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleUpdateUser(editingUser._id, {
                    role: formData.get("role") as "user" | "manager" | "owner",
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Role
                  </label>
                  <select
                    name="role"
                    defaultValue={editingUser.role}
                    disabled={currentUser?.role !== "owner"}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    {currentUser?.role === "owner" && <option value="owner">Owner</option>}
                  </select>
                  {currentUser?.role !== "owner" && (
                    <p className="mt-1 text-sm text-gray-500">
                      Only owners can change user roles.
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && userToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-center text-gray-900 dark:text-white mb-4">
                Delete User
              </h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                Are you sure you want to delete {userToDelete.email}? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setUserToDelete(null);
                    setIsDeleteModalOpen(false);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteUser(userToDelete._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
