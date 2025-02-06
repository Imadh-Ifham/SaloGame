import React, { useState, useEffect } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import axiosInstance from "../../../axios.config";
import { auth } from "../../../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

interface Manager {
  _id: string;
  email: string;
  role: string;
  firebaseUid: string;
}

const ManagerPanel = () => {
  const [email, setEmail] = useState("");
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");

  // Fetch managers on component mount
  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await axiosInstance.get<Manager[]>("/users");
      // Filter for only manager users and sort by email
      const managerUsers = response.data
        .filter((user: Manager) => user.role === "manager")
        .sort((a, b) => a.email.localeCompare(b.email));
      setManagers(managerUsers);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch managers");
    }
  };

  // Generate a secure random password
  const generatePassword = () => {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  };

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Generate password first
    const password = generatePassword();
    setGeneratedPassword(password);
    setShowPassword(true); // Set this to true before API calls

    try {
      // Create Firebase user
      const firebaseUser = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const token = await firebaseUser.user.getIdToken();
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

      // Create manager in MongoDB
      const response = await axiosInstance.post("/users/managers", {
        email,
        firebaseUid: firebaseUser.user.uid,
      });

      if ((response.data as { success: boolean }).success) {
        setSuccessMessage("Manager created successfully");
        await fetchManagers(); // Wait for fetch to complete
        setEmail("");
      }
    } catch (err: any) {
      console.error("Creation Error:", err);
      setShowPassword(false); // Hide password on error
      setGeneratedPassword(""); // Clear password on error
      if (err.code === "auth/email-already-in-use") {
        setError("Email already in use");
      } else {
        setError(err.response?.data?.message || "Failed to create manager");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteManager = async (managerId: string) => {
    if (!window.confirm("Are you sure you want to remove this manager?")) {
      return;
    }

    try {
      // Find the manager's firebaseUid
      const managerToDelete = managers.find(
        (manager) => manager._id === managerId
      );
      if (!managerToDelete) {
        throw new Error("Manager not found");
      }
      // Delete from Firebase first
      await axiosInstance.delete(`/users/${managerToDelete.firebaseUid}`);

      // Then delete from MongoDB
      await axiosInstance.delete(`/users/${managerId}`);

      setSuccessMessage("Manager removed successfully");
      fetchManagers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete manager");
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Manager Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Create Manager</h2>
        <form onSubmit={handleCreateManager} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                     shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/10 rounded">
              {error}
            </div>
          )}

          {showPassword && generatedPassword && (
            <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                Manager Account Created
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                Please securely share these credentials with the manager:
              </p>
              <div className="bg-white dark:bg-gray-800 p-3 rounded border border-green-200 dark:border-green-800">
                <p className="text-sm mb-1">
                  <span className="font-medium">Email:</span> {email}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Password:</span>{" "}
                  {generatedPassword}
                </p>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                Make sure to save or copy this information - you won't be able
                to see it again!
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors
                     ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Creating..." : "Create Manager"}
          </button>
        </form>
      </div>

      {/* Managers List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Current Managers</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={2}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : managers.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No managers found
                  </td>
                </tr>
              ) : (
                managers.map((manager) => (
                  <tr key={manager._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {manager.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDeleteManager(manager._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {managers.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No managers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerPanel;
