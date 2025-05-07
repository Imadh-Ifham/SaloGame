import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import HomeLayout from "../layout/HomeLayout";
import { auth } from "../../../config/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "../../../hooks/useAuth";
import { FiLogOut, FiUser, FiCalendar, FiHelpCircle, FiSettings } from "react-icons/fi";
import UserMembershipDashboard from "../../../components/User/userMembershipDashboard";
import UserEventDashboard from "../../../components/User/userEventDashboard"; 
import UserSupportDashboard from "../../../components/User/userSupportDashboard";
import UserProfileSettings from "../../../components/User/UserProfileSettings";
import VisitsChart from "../../../components/User/VisitChart";
interface UserProfile {
  email: string;
  name?: string;
  role?: string;
  googlePhotoUrl?: string;
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
  useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleProfileUpdate = (newData: { name?: string; profileImage?: string }) => {
    setProfile(prev => prev ? {
      ...prev,
      name: newData.name || prev.name,
      googlePhotoUrl: newData.profileImage || prev.googlePhotoUrl,
    } : null);
  };

  const sidebarItems = [
    { id: "overview", icon: <FiUser />, label: "Overview" },
    { id: "membership", icon: <FiCalendar />, label: "Membership" },
    { id: "events", icon: <FiCalendar />, label: "Events" },
    { id: "support", icon: <FiHelpCircle />, label: "Support" },
    { id: "settings", icon: <FiSettings />, label: "Settings" }
  ];

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

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 bg-gray-800/40 backdrop-blur-lg rounded-xl p-4 h-[calc(100vh-120px)] sticky top-24">
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => item.id === "settings" ? setIsSettingsOpen(true) : setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === item.id ? "bg-emerald-500/20 text-emerald-400" : "text-gray-400 hover:text-gray-300"
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
                    <img
                      src={profile?.googlePhotoUrl || "default-avatar.png"}
                      alt="Profile"
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        {profile?.name || profile?.email?.split("@")[0]}
                      </h2>
                      <p className="text-gray-400">{profile?.email}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Visits Activity Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">Gaming Activity</h3>
                  <div className="h-[300px]">
                    <VisitsChart />
                  </div>
                </motion.div>
              </div>
            )}


            {activeTab === "membership" && <UserMembershipDashboard profile={profile} />}
           
            {activeTab === "events" && <UserEventDashboard />}
            {activeTab === "support" && <UserSupportDashboard />}
          </div>
        </div>

        <UserProfileSettings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          currentName={profile?.name || profile?.email?.split("@")[0] || ""}
          currentImage={profile?.googlePhotoUrl}
          onUpdate={handleProfileUpdate}
        />
      </div>
    </HomeLayout>
  );
};

export default ProfilePage;