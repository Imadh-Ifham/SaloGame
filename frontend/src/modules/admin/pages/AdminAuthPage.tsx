import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import axiosInstance from "../../../axios.config";

const AdminAuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Sign in with Firebase
      const firebaseUser = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await firebaseUser.user.getIdToken();

      // Verify with backend
      const response = await axiosInstance.post("users/auth/firebase", {
        firebaseUser: {
          uid: firebaseUser.user.uid,
          email: firebaseUser.user.email,
        },
        token,
      });

      const userData = response.data.user;

      // Only allow manager or owner roles
      if (!["manager", "owner"].includes(userData.role)) {
        throw new Error("Unauthorized access");
      }

      localStorage.setItem("token", token);
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
      navigate("/admin/overview");
    } catch (err: any) {
      setError("Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Login
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Sign in to admin dashboard
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {loading ? "Processing..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAuthPage;
