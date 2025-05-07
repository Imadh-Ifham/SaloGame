import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import HomeLayout from "../layout/HomeLayout";
import axiosInstance from "../../../axios.config";
import { auth } from "../../../config/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "../../../hooks/useAuth";
import { 
  FiLogOut, 
  FiChevronDown, 
  FiChevronUp, 
  FiSettings, 
  FiStar, 
  FiShield, 
  FiAward,
  FiUsers,
  FiCalendar,
  FiHelpCircle,
  FiMail,
  FiPhone,
  FiClock
} from "react-icons/fi";
import { IoGameControllerOutline, IoPeopleOutline, IoMedalOutline } from "react-icons/io5";
import { GiTrophyCup } from "react-icons/gi"; // Replace with a valid icon
import UserProfileSettings from "../../../components/User/UserProfileSettings";
import VisitsChart from "../../../components/User/VisitChart";
import NotificationArea from "../../../components/notifications/NotificationArea";

interface UserProfile {
  email: string;
  name?: string;
  role?: string;
  defaultMembershipId?: {
    name: string;
    price: number;
    benefits: string[];
  };
  googlePhotoUrl?: string;
  phone?: string;
  tournaments?: {
    id: string;
    name: string;
    date: string;
    position: number;
    team: string;
  }[];
  bookings?: {
    id: string;
    game: string;
    date: string;
    duration: number;
    status: 'completed' | 'upcoming' | 'cancelled';
  }[];
  teams?: {
    id: string;
    name: string;
    game: string;
    role: string;
  }[];
}

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-700/50 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-3 text-left"
      >
        <span className="text-sm font-medium text-gray-200">{question}</span>
        {isOpen ? <FiChevronUp className="text-emerald-400" /> : <FiChevronDown className="text-emerald-400" />}
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="pb-3 text-xs text-gray-400">{answer}</div>
        </motion.div>
      )}
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

      if (profile?.role === "owner" || profile?.role === "manager") {
        navigate("/admin/auth");
      } else {
        navigate("/auth");
      }
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

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case "admin":
        return <FiShield className="w-3 h-3" />;
      case "manager":
        return <FiStar className="w-3 h-3" />;
      case "owner":
        return <FiAward className="w-3 h-3" />;
      default:
        return <IoGameControllerOutline className="w-3 h-3" />;
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "admin":
        return "text-purple-400 bg-purple-500/20";
      case "manager":
        return "text-yellow-400 bg-yellow-500/20";
      case "owner":
        return "text-red-400 bg-red-500/20";
      default:
        return "text-emerald-400 bg-emerald-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-400 bg-emerald-500/10';
      case 'upcoming':
        return 'text-cyan-400 bg-cyan-500/10';
      case 'cancelled':
        return 'text-red-400 bg-red-500/10';
      default:
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  const faqs = [
    {
      question: "How do I join a tournament?",
      answer: "Navigate to the Tournaments section, find an upcoming event, and click 'Register'. You'll need an active membership to participate."
    },
    {
      question: "Can I cancel a booking?",
      answer: "Yes, bookings can be cancelled up to 24 hours before the scheduled time without penalty."
    },
    {
      question: "How are tournament rankings calculated?",
      answer: "Rankings are based on a combination of match wins, individual performance metrics, and opponent strength."
    },
    {
      question: "What happens if I'm late for my booking?",
      answer: "Your booking time will still end at the scheduled time. We recommend arriving at least 15 minutes early."
    }
  ];

  return (
    <HomeLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8 min-h-screen font-poppins">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Profile Cards */}
          <div className="lg:col-span-1 space-y-4">
            {/* Gamer Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-3 border border-gray-700/50 shadow-lg"
            >
              <div className="flex gap-3 items-center">
                {/* Hexagon Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 clip-polygon bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 p-0.5 glow-effect">
                    <div className="w-full h-full clip-polygon bg-gray-900 flex items-center justify-center overflow-hidden">
                      {profile?.googlePhotoUrl ? (
                        <img
                          src={profile.googlePhotoUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold text-emerald-400">
                          {profile?.name?.charAt(0).toUpperCase() || 
                           profile?.email.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-bold text-gray-100 truncate">
                        {profile?.name || profile?.email.split("@")[0]}
                      </h2>
                      <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
                    </div>
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="p-1.5 hover:bg-gray-800/50 rounded-full transition-colors"
                    >
                      <FiSettings className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                  </div>
                  
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full mt-1.5 ${getRoleColor(profile?.role)}`}>
                    {getRoleIcon(profile?.role)}
                    <span className="text-xs font-medium">
                      {profile?.role
                        ? profile.role === "user"
                          ? "PLAYER"
                          : `${profile.role.toUpperCase()}`
                        : "PLAYER"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-3 border border-gray-700/50 shadow-lg"
            >
              <h3 className="font-semibold text-gray-100 flex items-center gap-1.5 mb-2">
                <FiMail className="text-cyan-400" size={14} />
                <span>Contact Information</span>
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FiMail className="text-gray-400 w-3.5 h-3.5" />
                  <span className="text-xs text-gray-300">{profile?.email}</span>
                </div>
                
                {profile?.phone ? (
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-gray-400 w-3.5 h-3.5" />
                    <span className="text-xs text-gray-300">{profile.phone}</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <FiPhone className="w-3 h-3" />
                    Add phone number
                  </button>
                )}
              </div>
            </motion.div>

            {/* Membership Card */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.2 }}
              className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-3 border border-gray-700/50 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-100 flex items-center gap-1.5">
                  <FiStar className="text-yellow-400" size={14} />
                  <span>Membership</span>
                </h3>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/memberships")}
                  className="px-2 py-1 bg-emerald-500/20 rounded text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors"
                >
                  {profile?.defaultMembershipId
                    ? "Change"
                    : "Get Plan"}
                </motion.button>
              </div>

              {profile?.defaultMembershipId ? (
                <div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-900/30 rounded-lg p-2">
                      <p className="text-xs text-gray-400">Plan</p>
                      <p className="text-xs font-medium text-emerald-400 truncate">
                        {profile.defaultMembershipId.name}
                      </p>
                    </div>
                    <div className="bg-gray-900/30 rounded-lg p-2">
                      <p className="text-xs text-gray-400">Price</p>
                      <p className="text-xs font-medium text-cyan-400">
                        ${profile.defaultMembershipId.price}/mo
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="mt-2 flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                  >
                    {showDetails ? (
                      <>
                        <FiChevronUp size={12} /> Hide Benefits
                      </>
                    ) : (
                      <>
                        <FiChevronDown size={12} /> Show Benefits
                      </>
                    )}
                  </button>

                  {showDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 gap-1.5">
                        {profile.defaultMembershipId.benefits.map(
                          (benefit, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1.5 p-1.5 bg-gray-900/30 rounded"
                            >
                              <div className="flex-shrink-0 w-4 h-4 rounded bg-emerald-500/10 flex items-center justify-center">
                                <span className="text-emerald-400 text-xs">✓</span>
                              </div>
                              <span className="text-xs text-gray-300 line-clamp-1">
                                {benefit}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="py-2 text-center space-y-1 bg-gray-900/30 rounded-lg">
                  <div className="text-xl">🔒</div>
                  <p className="text-xs text-gray-400">
                    No active membership
                  </p>
                </div>
              )}
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.3 }}
              className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-3 border border-gray-700/50 shadow-lg"
            >
              <h3 className="font-semibold text-gray-100 mb-2">Notifications</h3>
              <div className="max-h-48 overflow-y-auto">
                <NotificationArea compact={true} />
              </div>
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.4 }}
              className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-3 border border-gray-700/50 shadow-lg"
            >
              <h3 className="font-semibold text-gray-100 flex items-center gap-1.5 mb-2">
                <FiHelpCircle className="text-purple-400" size={14} />
                <span>FAQs</span>
              </h3>
              <div className="space-y-1">
                {faqs.map((faq, index) => (
                  <FAQItem key={index} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Stats and Tabs */}
          <div className="lg:col-span-2 space-y-4">
            {/* Gaming Activity Chart */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-4 border border-gray-700/50 shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-1.5">
                  <IoGameControllerOutline className="text-cyan-400" />
                  <span>Gaming Activity</span>
                </h2>
                <div className="flex gap-2">
                  <select className="bg-gray-900/50 text-xs border-0 rounded py-1 px-2 text-gray-300">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                  </select>
                </div>
              </div>
              <div className="h-[300px]">
                <VisitsChart />
              </div>
            </motion.div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-700/50">
              <button
                onClick={() => setActiveTab('events')}
                className={`px-4 py-2 text-sm font-medium relative ${activeTab === 'events' ? 'text-emerald-400' : 'text-gray-400 hover:text-gray-300'}`}
              >
                Events & Tournaments
                {activeTab === 'events' && (
                  <motion.div
                    layoutId="tabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-4 py-2 text-sm font-medium relative ${activeTab === 'bookings' ? 'text-emerald-400' : 'text-gray-400 hover:text-gray-300'}`}
              >
                Bookings
                {activeTab === 'bookings' && (
                  <motion.div
                    layoutId="tabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('teams')}
                className={`px-4 py-2 text-sm font-medium relative ${activeTab === 'teams' ? 'text-emerald-400' : 'text-gray-400 hover:text-gray-300'}`}
              >
                Teams
                {activeTab === 'teams' && (
                  <motion.div
                    layoutId="tabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
                  />
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-gray-800/40 backdrop-blur-lg rounded-xl p-4 border border-gray-700/50 shadow-xl">
              {activeTab === 'events' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                      <GiTrophyCup className="text-yellow-400" />
                      <span>Tournaments & Events</span>
                    </h3>
                    <button
                      onClick={() => navigate('/tournaments')}
                      className="px-3 py-1 bg-emerald-500/20 rounded text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
                    >
                      <FiCalendar size={12} />
                      View All
                    </button>
                  </div>

                  {profile?.tournaments && profile.tournaments.length > 0 ? (
                    <div className="space-y-3">
                      {profile.tournaments.map((tournament) => (
                        <div key={tournament.id} className="bg-gray-900/30 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-medium text-gray-100">{tournament.name}</h4>
                              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <FiCalendar className="w-3 h-3" />
                                {new Date(tournament.date).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <FiUsers className="w-3 h-3" />
                                {tournament.team}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {tournament.position <= 3 ? (
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/20">
                                  <IoMedalOutline className="text-yellow-400 w-3 h-3" />
                                </div>
                              ) : null}
                              <span className={`text-xs px-2 py-1 rounded-full ${tournament.position <= 3 ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-400 bg-gray-500/10'}`}>
                                #{tournament.position}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <GiTrophyCup className="mx-auto text-4xl text-gray-600 mb-2" />
                      <p className="text-sm text-gray-400">No tournament history yet</p>
                      <button
                        onClick={() => navigate('/tournaments')}
                        className="mt-3 px-4 py-1.5 bg-emerald-500/20 rounded-lg text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors"
                      >
                        Join a Tournament
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'bookings' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                      <FiClock className="text-cyan-400" />
                      <span>Game Bookings</span>
                    </h3>
                    <button
                      onClick={() => navigate('/bookings')}
                      className="px-3 py-1 bg-emerald-500/20 rounded text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
                    >
                      <FiCalendar size={12} />
                      New Booking
                    </button>
                  </div>

                  {profile?.bookings && profile.bookings.length > 0 ? (
                    <div className="space-y-3">
                      {profile.bookings.map((booking) => (
                        <div key={booking.id} className="bg-gray-900/30 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-medium text-gray-100">{booking.game}</h4>
                              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <FiCalendar className="w-3 h-3" />
                                {new Date(booking.date).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Duration: {booking.duration} hours
                              </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiClock className="mx-auto text-4xl text-gray-600 mb-2" />
                      <p className="text-sm text-gray-400">No bookings yet</p>
                      <button
                        onClick={() => navigate('/bookings')}
                        className="mt-3 px-4 py-1.5 bg-emerald-500/20 rounded-lg text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors"
                      >
                        Book a Session
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'teams' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                      <IoPeopleOutline className="text-purple-400" />
                      <span>Team Memberships</span>
                    </h3>
                    <button
                      onClick={() => navigate('/teams')}
                      className="px-3 py-1 bg-emerald-500/20 rounded text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
                    >
                      <FiUsers size={12} />
                      Browse Teams
                    </button>
                  </div>

                  {profile?.teams && profile.teams.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {profile.teams.map((team) => (
                        <div key={team.id} className="bg-gray-900/30 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-gray-100">{team.name}</h4>
                          <p className="text-xs text-gray-400 mt-1">{team.game}</p>
                          <div className="mt-2 flex justify-between items-center">
                            <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-400">
                              {team.role}
                            </span>
                            <button className="text-xs text-emerald-400 hover:text-emerald-300">
                              View Team
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <IoPeopleOutline className="mx-auto text-4xl text-gray-600 mb-2" />
                      <p className="text-sm text-gray-400">Not part of any teams yet</p>
                      <button
                        onClick={() => navigate('/teams')}
                        className="mt-3 px-4 py-1.5 bg-emerald-500/20 rounded-lg text-emerald-400 text-xs hover:bg-emerald-500/30 transition-colors"
                      >
                        Join a Team
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* UserProfileSettings component */}
      <UserProfileSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentName={profile?.name || profile?.email.split("@")[0] || ""}
        currentImage={profile?.googlePhotoUrl}
        onUpdate={handleProfileUpdate}
      />

      {/* CSS */}
      <style>{`
        .clip-polygon {
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }
        .glow-effect {
          position: relative;
        }
        .glow-effect::after {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #10b981, #06b6d4, #10b981);
          background-size: 200% 200%;
          z-index: -1;
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          animation: gradientGlow 3s ease infinite;
          opacity: 0.7;
          filter: blur(4px);
        }
        @keyframes gradientGlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </HomeLayout>
  );
};

export default ProfilePage;