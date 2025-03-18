// frontend/src/modules/users/pages/ProfilePage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import HomeLayout from "../layout/HomeLayout";
import { FiEdit, FiSave, FiX, FiLogOut } from "react-icons/fi";
import axiosInstance from "@/axios.config";
import { useAuth } from "../../../hooks/useAuth"; 
import { signOut } from "firebase/auth";
import { auth } from "../../../config/firebase";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  // remove hard-coded initial values
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [bookedEvents] = useState([
    { id: "1", title: "CS:GO Tournament", date: "2023-12-15", machine: "PC #12" },
    { id: "2", title: "Valorant Night", date: "2023-12-20", machine: "PC #05" },
  ]);
  const [memberships, setMemberships] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setEditedName(user.email); // update this if you have a name field
      setEditedEmail(user.email);
    }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Save logic here
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out from Firebase
      localStorage.removeItem("token");
      delete axiosInstance.defaults.headers.common["Authorization"];
      navigate("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleViewMemberships = () => {
    navigate("/memberships");
  };

  const handleBookNewEvent = () => {
    navigate("/bookings");
  };

  if (loading) {
    return <div>Loading...</div>;
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
         <div className="bg-transparent backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 opacity-30" />
            {/* Profile Header */}
            <div className="flex flex-col items-center mb-8 relative z-10">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gray-800 border-4 border-emerald-500/30 overflow-hidden shadow-lg hover:border-emerald-500/50 transition-colors">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-emerald-500/10 flex items-center justify-center">
                      <span className="text-4xl font-bold text-emerald-400 font-orbitron">
                        {editedName.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <FiEdit className="text-emerald-400 w-6 h-6" />
                  </label>
                )}
              </div>
              <div className="mt-4 text-center">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="text-2xl font-bold bg-gray-800/50 text-emerald-400 text-center border-b border-emerald-500/50 focus:outline-none font-orbitron"
                    />
                    <input
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      className="text-lg bg-gray-800/50 text-gray-300 text-center border-b border-emerald-500/50 focus:outline-none mt-2"
                    />
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-emerald-400 font-orbitron drop-shadow-glow">{editedName}</h2>
                    <p className="text-lg text-gray-300">{editedEmail}</p>
                  </>
                )}
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium tracking-wide">
                    VIP TERMINAL
                  </span>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-1.5 hover:bg-gray-800/50 rounded-full transition-colors text-emerald-400 hover:text-emerald-300"
                  >
                    {isEditing ? <FiX size={18} /> : <FiEdit size={18} />}
                  </button>
                </div>
              </div>
            </div>
            {/* ... rest of your component */}
            <div className="mt-8 flex flex-col gap-4 relative z-10">
              {isEditing && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleSaveProfile}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:from-emerald-500 hover:to-cyan-500 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <FiSave size={18} />
                  COMMIT CHANGES
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleViewMemberships}
                className="w-full py-3 bg-gray-800/50 border border-emerald-500/30 text-emerald-400 rounded-xl hover:border-emerald-500/50 flex items-center justify-center gap-2"
              >
                EXPLORE MEMBERSHIPS
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