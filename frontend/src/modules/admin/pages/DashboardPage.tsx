// src/modules/admin/pages/DashboardPage.tsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../../axios.config";
import HomeLayout from "../../users/layout/HomeLayout";
interface User {
  _id: string;
  email: string;
  role: "user" | "admin";
}

const DashboardPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/users");
      setUsers(response.data);
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await axiosInstance.put(`/users/${userId}`, updates);
      fetchUsers();
      setEditingUser(null);
    } catch (err) {
      setError("Failed to update user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/users/${userId}`);
      fetchUsers();
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <HomeLayout>
      <div className="container mx-auto px-4 py-8">
  <h1 className="text-2xl font-bold mb-6 text-white">User Management</h1>

  <div className="bg-dark-800 text-white rounded-lg shadow overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-700">
      <thead className="bg-dark-700">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            Email
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            Role
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-dark-800 text-white divide-y divide-gray-700">
        {users.map((user) => (
          <tr key={user._id}>
            <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
            <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <button
                onClick={() => setEditingUser(user)}
                className="text-blue-400 hover:text-blue-600 mr-4"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteUser(user._id)}
                className="text-red-400 hover:text-red-600"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {editingUser && (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-dark-800 text-white p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">Edit User</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateUser(editingUser._id, {
              role: (e.target as any).role.value,
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Role
            </label>
            <select
              name="role"
              defaultValue={editingUser.role}
              className="mt-1 block w-full rounded-md border-gray-600 shadow-sm bg-dark-700 text-white"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="px-4 py-2 text-gray-300 hover:text-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
</div>

    </HomeLayout>
  );
};

export default DashboardPage;