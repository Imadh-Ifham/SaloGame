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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionDetails from "../components/subscription/SubscriptionDetails";
import PaymentHistory from "../components/subscription/PaymentHistory";
import PaymentMethodsManager from "../components/subscription/PaymentMethodsManager";
import PlanOptions from "../components/subscription/PlanOptions"; // Added missing import

interface UserProfile {
  email: string;
  role?: string;
  defaultMembershipId?: {
    name: string;
    price: number;
    benefits: string[];
  };
  profileImage?: string;
}

const ProfilePage: React.FC = () => {
  interface User {
    _id: string;
    email: string;
    role?: string;
  }

  const { user, loading: authLoading } = useAuth() as {
    user: User | null;
    loading: boolean;
  };
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [userSubscription, setUserSubscription] = useState(null); // Added state for subscription
  const navigate = useNavigate();

  // Profile fetching
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
        const userProfile = response.data as UserProfile;
        setProfile(userProfile);
        // Set preview from profile image if exists
        if (userProfile.profileImage) {
          setPreviewImage(userProfile.profileImage);
        }
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

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;
        const response = await axiosInstance.get("/subscriptions/user");

        // Find active subscription if any
        const activeSubscription = response.data.data.find(
          (sub: any) => sub.status === "active"
        );

        if (activeSubscription) {
          setUserSubscription(activeSubscription);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      }
    };

    if (!loading && !error) {
      fetchSubscription();
    }
  }, [loading, error]);

  // Refetch user data function (added to resolve the reference in TabsContent)
  const refetchUserData = async () => {
    try {
      const response = await axiosInstance.get("/subscriptions/user");

      // Find active subscription if any
      const activeSubscription = response.data.data.find(
        (sub: any) => sub.status === "active"
      );

      if (activeSubscription) {
        setUserSubscription(activeSubscription);
      } else {
        setUserSubscription(null);
      }
    } catch (error) {
      console.error("Error refetching user data:", error);
    }
  };

  // Logout handling
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

  // Image uploading
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview file
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Create a form data to upload image
      const formData = new FormData();
      formData.append("profileImage", file);
      try {
        const response = await axiosInstance.post(
          "/users/profile/upload-image",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (profile) {
          setProfile({ ...profile, profileImage: response.data.imageUrl });
        }
      } catch (error) {
        console.error("Image upload error:", error);
      }
    }
  };

  // Delete image
  const handleDeleteImage = async () => {
    if (!window.confirm("Do you want to delete the image?")) return;

    try {
      await axiosInstance.delete("/users/profile/delete-image");
      setPreviewImage(null);
      if (profile) {
        setProfile({ ...profile, profileImage: undefined });
      }
    } catch (error) {
      console.error("Error deleting image:", error);
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
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 p-1.5">
                  <div className="w-full h-full rounded-xl bg-gray-900 flex items-center justify-center overflow-hidden">
                    {previewImage ? (
                      <img
                        src={previewImage}
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
                {/* Upload Label */}
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <span className="text-sm text-white">Upload Image</span>
                </label>
              </div>

              {/* If image exists, show Delete button */}
              {previewImage && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeleteImage}
                  className="px-3 py-1 bg-red-500/20 rounded text-red-400 text-sm hover:bg-red-500/30 transition-colors"
                >
                  Delete Image
                </motion.button>
              )}

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

          {/* Membership Section */}
          {userSubscription ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Your Membership
                </h2>

                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid grid-cols-4 mb-6">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="history">Payment History</TabsTrigger>
                    <TabsTrigger value="payment-methods">
                      Payment Methods
                    </TabsTrigger>
                    <TabsTrigger value="plan-options">Change Plan</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details">
                    <SubscriptionDetails subscription={userSubscription} />
                  </TabsContent>

                  <TabsContent value="history">
                    {user && <PaymentHistory userId={user._id || ""} />}
                  </TabsContent>

                  <TabsContent value="payment-methods">
                    <PaymentMethodsManager
                      subscription={userSubscription}
                      onUpdate={refetchUserData}
                    />
                  </TabsContent>

                  <TabsContent value="plan-options">
                    <PlanOptions
                      currentSubscription={userSubscription}
                      onChangePlan={refetchUserData}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          ) : (
            <div className="py-8 text-center space-y-4">
              <div className="text-4xl">🔒</div>
              <p className="text-gray-400">
                No active membership. Subscribe to unlock exclusive features!
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </HomeLayout>
  );
};

export default ProfilePage;
