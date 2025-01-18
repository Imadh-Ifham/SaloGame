import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import HomeLayout from "../layout/HomeLayout";
import axiosInstance from "../../../axios.config";

interface UserProfile {
  email: string;
  name?: string;
  role: string;
  joinedDate?: string;
  defaultMembershipId: {
    _id: string;
    name: string;
    tagline?: string;
    price: number;
    benefits: string[];
  };
}

const ProfilePage: React.FC = () => {
  const [membershipType, setMembershipType] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembershipType = async () => {
      try {
        const response = await axiosInstance.get<{ name: string }>(
          "/membership/current"
        );
        setMembershipType(response.data.name);
      } catch (error) {
        console.error("Error fetching membership type:", error);
      }
    };

    fetchMembershipType();

    const fetchProfile = async () => {
      try {
        setLoading(true);

        // Retrieve the token from localStorage
        const token = localStorage.getItem("token");
        if (token) {
          // Set the token in axios headers
          axiosInstance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${token}`;
        }

        const response = await axiosInstance.get("/users/profile");

        // Log the request headers for debugging
        console.log("Request Headers:", axiosInstance.defaults.headers.common);

        setProfile(response.data as UserProfile);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

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

                {/* Membership Information  */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Current Membership
                  </label>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold text-primary dark:text-primary-light">
                      {profile?.defaultMembershipId?.name || "Basic Warrior"}
                    </h3>
                    {/*{profile?.defaultMembershipId?.tagline && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 italic">
                        {profile.defaultMembershipId.tagline}
                      </p>
                    )}*/}
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Price: ${profile?.defaultMembershipId?.price}/month
                      </p>
                      {/*{profile?.defaultMembershipId?.benefits && (
                        <ul className="mt-2 space-y-1">
                          {profile.defaultMembershipId.benefits.map(
                            (benefit, index) => (
                              <li
                                key={index}
                                className="text-sm text-gray-600 dark:text-gray-300 flex items-center"
                              >
                                <span className="text-primary mr-2">✓</span>
                                {benefit}
                              </li>
                            )
                          )}
                        </ul>
                      )}*/}
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => navigate("/memberships")}
                      className="text-primary dark:text-primary-light hover:underline text-sm"
                    >
                      View Available Memberships →
                    </button>
                  </div>
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

              {/* Logout Button */}
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200"
                >
                  Logout
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
