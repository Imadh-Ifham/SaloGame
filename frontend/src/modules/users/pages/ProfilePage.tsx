import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import HomeLayout from "../layout/HomeLayout";
import axiosInstance from "../../../axios.config";
import { auth } from "../../../config/firebase";
import NotificationArea from "../../../components/notifications/NotificationArea";

const ProfilePage: React.FC = () => {
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

        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;
        const response = await axiosInstance.get("/users/profile");
        setProfile(response.data as UserProfile);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch profile"
        );
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
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

  if (loading) {
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
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-3xl font-press text-primary mb-8 text-center">
            My Profile
          </h1>

          <NotificationArea />

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-primary">
            {/* Profile Information */}
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info Section */}
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Email
                    </label>
                    <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                      {profile?.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Role
                    </label>
                    <p className="mt-1 text-lg font-medium capitalize bg-primary/10 dark:bg-primary/20 text-primary rounded-full px-3 py-1 inline-block">
                      {profile?.role}
                    </p>
                  </div>
                </div>

                {/* Membership Info Section */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Current Membership
                  </label>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    {profile?.defaultMembershipId ? (
                      <>
                        <h3 className="text-lg font-semibold text-primary dark:text-primary-light">
                          {profile.defaultMembershipId.name}
                        </h3>
                        <div className="mt-3 space-y-2">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Price: ${profile.defaultMembershipId.price}/month
                          </p>
                          <div className="space-y-1">
                            {profile.defaultMembershipId.benefits.map(
                              (benefit, index) => (
                                <p
                                  key={index}
                                  className="text-sm text-gray-600 dark:text-gray-300 flex items-center"
                                >
                                  <span className="text-green-500 mr-2">✓</span>
                                  {benefit}
                                </p>
                              )
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                          No Active Membership
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Subscribe to unlock exclusive benefits!
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => navigate("/memberships")}
                    className="w-full mt-4 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors duration-200"
                  >
                    {profile?.defaultMembershipId
                      ? "View Other Memberships"
                      : "Browse Memberships"}
                  </button>
                </div>
              </div>

              {/* Logout Button */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleLogout}
                  className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
                >
                  <span className="mr-2">Logout</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H3zm11.707 4.707a1 1 0 0 0-1.414-1.414L10 9.586 6.707 6.293a1 1 0 0 0-1.414 1.414L8.586 11l-3.293 3.293a1 1 0 1 0 1.414 1.414L10 12.414l3.293 3.293a1 1 0 0 0 1.414-1.414L11.414 11l3.293-3.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </HomeLayout>
  );
};

export default ProfilePage;
