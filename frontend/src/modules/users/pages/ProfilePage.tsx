import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import HomeLayout from "../layout/HomeLayout";
import { FiEdit, FiSave, FiX, FiLogOut } from "react-icons/fi";
import axiosInstance from "@/axios.config";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("John Doe");
  const [editedEmail, setEditedEmail] = useState("john.doe@example.com");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [bookedEvents] = useState([
    { id: "1", title: "CS:GO Tournament", date: "2023-12-15", machine: "PC #12" },
    { id: "2", title: "Valorant Night", date: "2023-12-20", machine: "PC #05" },
  ]);
  const [memberships, setMemberships] = useState<any[]>([]);

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await axiosInstance.get("/memberships");
        setMemberships(response.data);
      } catch (error) {
        console.error("Error fetching memberships:", error);
      }
    };

    fetchMemberships();
  }, []);

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

  const handleLogout = () => {
    navigate("/login");
  };

  const handleViewMemberships = () => {
    navigate("/memberships");
  };

  const handleBookNewEvent = () => {
    navigate("/bookings");
  };

  return (
    <HomeLayout>
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50/50 to-gray-100/50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-primary/20 hover:border-primary/30 transition-all duration-300">
            {/* Profile Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-700 border-4 border-primary/10 overflow-hidden">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary">J</span>
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <FiEdit className="text-white w-6 h-6" />
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
                      className="text-2xl font-bold bg-transparent text-center border-b border-primary/50 focus:outline-none"
                    />
                    <input
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      className="text-lg bg-transparent text-center border-b border-primary/50 focus:outline-none mt-2"
                    />
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{editedName}</h2>
                    <p className="text-lg text-gray-900 dark:text-white">{editedEmail}</p>
                  </>
                )}
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">VIP Member</span>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    {isEditing ? <FiX size={18} /> : <FiEdit size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Info Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-primary mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                    <p className="mt-1 text-gray-900 dark:text-white">{editedEmail}</p>
                  </div>
                </div>
              </div>

              {/* Membership Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-primary mb-4">Membership</h3>
                {memberships.map((membership) => (
                  <div key={membership._id} className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
                    <div className="relative z-10">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{membership.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{membership.tagline}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Price: ${membership.price}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">XP Rate: {membership.xpRate}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Benefits: {membership.benefits.join(", ")}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Booked Events Section */}
              <div className="lg:col-span-2">
                <h3 className="text-xl font-semibold text-primary mb-4">Booked Events</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookedEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      whileHover={{ scale: 1.05 }}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-primary/30 transition-all cursor-pointer"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        <p>Date: {new Date(event.date).toLocaleDateString()}</p>
                        <p>Machine: {event.machine}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleBookNewEvent}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                  >
                    Book a new Event
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
                >
                  <FiSave size={18} />
                  Save Changes
                </button>
              </div>
            )}

            {/* View Memberships Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleViewMemberships}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                View Memberships
              </button>
            </div>

            {/* Logout Button */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLogout}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
              >
                <FiLogOut size={18} />
                Logout
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </HomeLayout>
  );
};

export default ProfilePage;