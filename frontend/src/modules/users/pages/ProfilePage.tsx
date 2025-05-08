import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import HomeLayout from "../layout/HomeLayout";
import { auth } from "../../../config/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "../../../hooks/useAuth";
import axiosInstance from "../../../axios.config";
import {
  FiLogOut,
  FiUser,
  FiCalendar,
  FiHelpCircle,
  FiSettings,
  FiCreditCard,
} from "react-icons/fi";
import UserMembershipDashboard from "../../../components/User/userMembershipDashboard";
import UserEventDashboard from "../../../components/User/userEventDashboard";
import UserSupportDashboard from "../../../components/User/userSupportDashboard";
import UserProfileSettings from "../../../components/User/UserProfileSettings";
import VisitsChart from "../../../components/User/VisitChart";
import NotificationArea from "../../../components/notifications/NotificationArea";

interface UserProfile {
  _id?: string;
  email: string;
  name?: string;
  role?: string;
  googlePhotoUrl?: string;
  profileImage?: string;
  defaultMembershipId?: {
    name: string;
    price: number;
    benefits: string[];
  };
}

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth() as {
    user: { _id: string; email: string; role?: string } | null;
    loading: boolean;
  };
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;
        const response = await axiosInstance.get<UserProfile>("/users/profile");
        setProfile(response.data);

        // Set preview from profile image if exists
        if (response.data.profileImage) {
          setPreviewImage(response.data.profileImage);
        } else if (response.data.googlePhotoUrl) {
          setPreviewImage(response.data.googlePhotoUrl);
        }

        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch profile");
        console.error("Error fetching profile:", err);
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

  const handleProfileUpdate = (newData: {
    name?: string;
    profileImage?: string;
  }) => {
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            name: newData.name || prev.name,
            profileImage: newData.profileImage || prev.profileImage,
            googlePhotoUrl: newData.profileImage || prev.googlePhotoUrl,
          }
        : null
    );

    if (newData.profileImage) {
      setPreviewImage(newData.profileImage);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleDeleteImage = async () => {
    if (!window.confirm("Do you want to delete the image?")) return;

    try {
      await axiosInstance.delete("/users/profile/delete-image");
      setPreviewImage(null);
      if (profile) {
        setProfile({
          ...profile,
          profileImage: undefined,
          googlePhotoUrl: undefined,
        });
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const sidebarItems = [
    { id: "overview", icon: <FiUser />, label: "Overview" },
    { id: "membership", icon: <FiCreditCard />, label: "Membership" },
    { id: "events", icon: <FiCalendar />, label: "Events" },
    { id: "support", icon: <FiHelpCircle />, label: "Support" },
    { id: "settings", icon: <FiSettings />, label: "Settings" },
  ];

  if (loading || authLoading) {
    return (
      <HomeLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </HomeLayout>
    );
  }

  if (error) {
    return (
      <HomeLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-red-500/10 text-red-500 p-4 rounded-lg border border-red-500/20">
            {error}
          </div>
        </div>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Player Profile
          </h1>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            <FiLogOut className="text-red-400" size={12} />
            <span className="text-red-400 text-xs font-medium">Logout</span>
          </motion.button>
        </div>

        <NotificationArea />

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 bg-gray-800/40 backdrop-blur-lg rounded-xl p-4 h-[calc(100vh-120px)] sticky top-24">
            <div className="p-4 mb-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 p-0.5">
                    <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold text-emerald-400">
                          {profile?.email.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium text-white truncate">
                    {profile?.name || profile?.email?.split("@")[0]}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {profile?.email}
                  </p>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() =>
                    item.id === "settings"
                      ? setIsSettingsOpen(true)
                      : setActiveTab(item.id)
                  }
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Player Info Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={previewImage || "/default-avatar.png"}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      {previewImage && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleDeleteImage}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                        >
                          ×
                        </motion.button>
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        {profile?.name || profile?.email?.split("@")[0]}
                      </h2>
                      <p className="text-gray-400">{profile?.email}</p>
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-gray-900 rounded-full">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-xs font-medium text-emerald-400">
                          {profile?.role
                            ? profile.role === "user"
                              ? "USER"
                              : `${profile.role.toUpperCase()} USER`
                            : "PREMIUM USER"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Visits Activity Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Gaming Activity
                  </h3>
                  <div className="h-[300px]">
                    <VisitsChart />
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === "membership" && (
              <UserMembershipDashboard profile={profile} />
            )}
            {activeTab === "events" && <UserEventDashboard />}
            {activeTab === "support" && <UserSupportDashboard />}
          </div>
        </div>

        <UserProfileSettings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          currentName={profile?.name || profile?.email?.split("@")[0] || ""}
          currentImage={previewImage}
          onUpdate={handleProfileUpdate}
        />
      </div>
    </HomeLayout>
  );
};

export default ProfilePage;
