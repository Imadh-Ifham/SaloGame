import React, { useState, useEffect, ChangeEvent } from "react";
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
  googlePhotoUrl?: string;
}

const ProfilePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const navigate = useNavigate();

  //profile fetching
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
        const userProfile = response.data as UserProfile;
        setProfile(userProfile);
        // Set preview from googlePhotoUrl if exists
        if (userProfile.googlePhotoUrl) {
          setPreviewImage(userProfile.googlePhotoUrl);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch profile");
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  //lgout handling
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
      <div className="py-12 px-4 sm:px-6 lg:px-8 min-h-screen font-poppins">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Profile
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <FiLogOut className="text-red-400" />
              <span className="text-red-400 text-sm font-medium">Logout</span>
            </motion.button>
          </div>

          <NotificationArea />

          {/* Profile Card */}
          <div className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-8 border border-gray-700/50 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Avatar Section */}
              
<div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 p-1.5">
  <div className="w-full h-full rounded-xl bg-gray-900 flex items-center justify-center overflow-hidden">
    {profile?.googlePhotoUrl ? (
      <img
        src={profile.googlePhotoUrl}
        alt="Profile"
        className="w-full h-full object-cover"
      />
    ) : (
      <span className="text-5xl font-bold text-emerald-400">
        {profile?.email.charAt(0).toUpperCase()}
      </span>
    )}
  </div>
</div>

             

              {/* Profile Info */}
              <div className="flex-1 space-y-3 text-center md:text-left">
                <div>
                  <p className="text-sm text-gray-400">Logged in as</p>
                  <h2 className="text-2xl font-bold text-gray-100">
                    {profile?.email}
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-900 rounded-full">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-emerald-400">
                    {profile?.role
                      ? profile.role === "user"
                        ? "USER"
                        : `${profile.role.toUpperCase()} USER`
                      : "PREMIUM USER"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Membership Card */}
          <div className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-8 border border-gray-700/50 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-100">
                Membership Details
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate("/memberships")}
                className="px-4 py-2 bg-emerald-500/20 rounded-lg text-emerald-400 text-sm hover:bg-emerald-500/30 transition-colors"
              >
                {profile?.defaultMembershipId
                  ? "Change Plan"
                  : "Get Membership"}
              </motion.button>
            </div>

            {profile?.defaultMembershipId ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Plan Name</p>
                  <p className="text-lg font-medium text-emerald-400">
                    {profile.defaultMembershipId.name}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Price</p>
                  <p className="text-lg font-medium text-cyan-400">
                    ${profile.defaultMembershipId.price}/month
                  </p>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <p className="text-sm text-gray-400">Benefits</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {profile.defaultMembershipId.benefits.map(
                      (benefit, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <span className="text-emerald-400">✓</span>
                          </div>
                          <span className="text-sm text-gray-300">
                            {benefit}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="text-4xl">🔒</div>
                <p className="text-gray-400">
                  No active membership. Subscribe to unlock exclusive features!
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </HomeLayout>
  );
};

export default ProfilePage;