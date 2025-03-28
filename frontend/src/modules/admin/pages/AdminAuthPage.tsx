import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { auth } from "../../../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import axiosInstance from "../../../axios.config";
import { motion } from "framer-motion";
import { FiLogIn, FiShield, FiAlertTriangle } from "react-icons/fi";

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
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setError("Invalid email or password");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many login attempts. Please try again later.");
      } else if (err.message === "Unauthorized access") {
        setError("You don't have admin privileges");
      } else {
        setError("Failed to authenticate. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/src/assets/grid-pattern.png')] bg-repeat opacity-5 pointer-events-none"></div>

      {/* Admin card with animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-200 dark:border-gray-700 relative z-10"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-emerald-500"></div>

        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center mb-4"
          >
            <div className="p-3 rounded-full bg-primary/10 dark:bg-primary/20">
              <FiShield className="w-8 h-8 text-primary" />
            </div>
          </motion.div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Access the SaloGame management dashboard
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900/30 flex items-center"
          >
            <FiAlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
              placeholder="admin@salogame.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 flex items-center justify-center bg-gradient-to-r from-primary to-emerald-600 hover:from-primary-dark hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg hover:shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all duration-300"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Authenticating...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <FiLogIn className="w-5 h-5 mr-2" />
                <span>Access Dashboard</span>
              </div>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <NavLink
            to="/"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors"
          >
            Return to main site
          </NavLink>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAuthPage;
