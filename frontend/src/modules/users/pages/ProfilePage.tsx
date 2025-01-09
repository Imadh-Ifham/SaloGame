import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HomeLayout from "../layout/HomeLayout";
import axiosInstance from "../../../axios.config";

interface UserProfile {
  email: string;
  name?: string;
  role: string;
  joinedDate?: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get("/users/profile");
        setProfile(response.data);
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <HomeLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Loading profile...
          </p>
        </div>
      </HomeLayout>
    );
  }

  if (error) {
    return (
      <HomeLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p className="text-lg text-red-500">{error}</p>
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

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-primary">
            <div className="space-y-6">
              {/* Profile Picture Placeholder */}
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 gap-6 mt-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </label>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {profile?.email}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Role
                  </label>
                  <p className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                    {profile?.role}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Member Since
                  </label>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {profile?.joinedDate
                      ? new Date(profile.joinedDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Edit Profile Button */}
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200"
                >
                  Edit Profile
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
