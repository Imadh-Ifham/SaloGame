import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import HomeLayout from "../layout/HomeLayout";
import axiosInstance from "../../../axios.config";
import { auth } from "../../../config/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "../../../hooks/useAuth";
import { FiLogOut } from "react-icons/fi";
import NotificationArea from "../../../components/notifications/NotificationArea";

interface UserProfile {
  email: string;
  role?: string;
  defaultMembershipId?: {
    name: string;
    price: number;
    benefits: string[];
  };
  // Add more fields if available
}

const ProfilePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await axiosInstance.get("/users/profile");
        setProfile(response.data as UserProfile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch profile");
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      delete axiosInstance.defaults.headers.common["Authorization"];

      // Role-based redirect
      if (profile?.role === "owner" || profile?.role === "manager") {
        navigate("/admin/auth");
      } else {
        navigate("/auth");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading || authLoading) {
    return (
      <HomeLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </HomeLayout>
    );
  }

  if (error) {
    return (
      <HomeLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        </div>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen font-poppins">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-press text-primary mb-8 text-center">
            My Profile
          </h1>

          <NotificationArea />

          <div className="bg-transparent backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 opacity-30" />

            {/* Profile Info */}
            <div className="flex flex-col items-center mb-8 relative z-10">
              <div className="w-32 h-32 rounded-full bg-gray-800 border-4 border-emerald-500/30 overflow-hidden shadow-lg">
                {/* Optionally display profile image if available */}
                <div className="w-full h-full bg-emerald-500/10 flex items-center justify-center">
                  <span className="text-4xl font-bold text-emerald-400 font-orbitron">
                    {profile?.email.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="mt-4 text-center">
                <h2 className="text-2xl font-bold text-emerald-400 font-orbitron drop-shadow-glow">
                  {profile?.email}
                </h2>
                <p className="text-lg text-gray-300">{profile?.email}</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium tracking-wide">
                    {profile?.role?.toUpperCase() || "VIP TERMINAL"}
                  </span>
                </div>
              </div>
            </div>

            {/* Membership Info Section */}
            <div className="space-y-4 relative z-10">
              <label className="text-sm font-medium text-gray-400">
                Current Membership
              </label>
              <div className="p-4 bg-gray-800/50 rounded-lg border border-emerald-500/30">
                {profile?.defaultMembershipId ? (
                  <>
                    <h3 className="text-lg font-semibold text-emerald-400">
                      {profile.defaultMembershipId.name}
                    </h3>
                    <div className="mt-3 space-y-2">
                      <p className="text-sm text-gray-300">
                        Price: ${profile.defaultMembershipId.price}/month
                      </p>
                      <div className="space-y-1">
                        {profile.defaultMembershipId.benefits.map((benefit, index) => (
                          <p key={index} className="text-sm text-gray-300 flex items-center">
                            <span className="text-emerald-400 mr-2">✓</span>
                            {benefit}
                          </p>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <h3 className="text-lg font-semibold text-gray-400">
                      No Active Membership
                    </h3>
                    <p className="text-sm text-gray-500 mt-2">
                      Subscribe to unlock exclusive benefits!
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 relative z-10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate("/memberships")}
                className="w-full py-3 bg-gray-800/50 border border-emerald-500/30 text-emerald-400 rounded-xl hover:border-emerald-500/50 flex items-center justify-center gap-2"
              >
                {profile?.defaultMembershipId
                  ? "VIEW OTHER MEMBERSHIPS"
                  : "EXPLORE MEMBERSHIPS"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="w-full py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl hover:border-red-400/50 flex items-center justify-center gap-2 mt-6"
              >
                <FiLogOut size={18} />
                LOG OUT
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </HomeLayout>
  );
};

export default ProfilePage;