import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import axiosInstance from '@/axios.config';
import { FaTrophy, FaMedal, FaAward, FaCrown, FaChevronDown } from 'react-icons/fa';
import HomeLayout from '../../layout/HomeLayout';
import confetti from 'canvas-confetti';

interface PlacementData {
  teamId: string;
  teamName: string;
  teamLogo: string;
  placement: number;
  awardedAt: string;
}

interface LeaderboardEvent {
  _id: string;
  eventName: string;
  category: string;
  placements: PlacementData[];
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Function to trigger confetti effect
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  // Fetch initial leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axiosInstance.get('/events/leaderboard');
        if (response.data.success) {
          setLeaderboard(response.data.data);
          // Trigger confetti effect when data loads
          setTimeout(triggerConfetti, 500);
        } else {
          setError('Failed to load leaderboard data');
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to connect to the server');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Set up Socket.IO connection for real-time updates
  useEffect(() => {
    const socket = io(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}`);
    
    socket.on('connect', () => {
      console.log('Connected to leaderboard socket');
    });
    
    socket.on('leaderboard:update', (data: any) => {
      setLeaderboard(prevLeaderboard => {
        // Find if this event exists in our current leaderboard
        const eventIndex = prevLeaderboard.findIndex(event => event._id === data.eventId);
        
        if (eventIndex >= 0) {
          // Update existing event
          const updatedLeaderboard = [...prevLeaderboard];
          updatedLeaderboard[eventIndex] = {
            ...updatedLeaderboard[eventIndex],
            placements: data.placements
          };
          // Trigger confetti on update
          triggerConfetti();
          return updatedLeaderboard;
        } else {
          // Add new event
          // Trigger confetti on new event
          triggerConfetti();
          return [...prevLeaderboard, {
            _id: data.eventId,
            eventName: data.eventName,
            category: data.category,
            placements: data.placements
          }];
        }
      });
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from leaderboard socket');
    });
    
    return () => {
      socket.disconnect();
    };
  }, []);

  // Filter leaderboard based on selected event
  const filteredLeaderboard = selectedEvent === 'all' 
    ? leaderboard 
    : leaderboard.filter(event => event._id === selectedEvent);

  // Render podium for an event's placements
  const renderPodium = (event: LeaderboardEvent) => {
    const sortedPlacements = [...event.placements].sort((a, b) => a.placement - b.placement);
    
    // Extract placements by position or use null if not present
    const firstPlace = sortedPlacements.find(p => p.placement === 1) || null;
    const secondPlace = sortedPlacements.find(p => p.placement === 2) || null;
    const thirdPlace = sortedPlacements.find(p => p.placement === 3) || null;

    return (
      <div className="mt-8 relative">
        {/* Podium Platform */}
        <div className="flex items-end justify-center h-64 relative">
          {/* Second Place Podium */}
          <div className="absolute left-0 bottom-0 sm:left-28 w-full sm:w-auto">
            {secondPlace && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <div className="relative">
                  <div className="relative z-10">
                    <img
                      src={secondPlace.teamLogo}
                      alt={secondPlace.teamName}
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-300 shadow-lg"
                    />
                    <div className="absolute -top-2 -right-2 bg-gray-300 text-gray-800 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                      <FaMedal size={16} />
                    </div>
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-gray-300 opacity-20"
                  >
                    <FaMedal size={120} className="filter blur-[2px]" />
                  </motion.div>
                </div>
                <div className="text-center mt-2 relative z-10">
                  <p className="font-semibold text-white">{secondPlace.teamName}</p>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="h-12 sm:h-20 bg-gradient-to-b from-gray-400 to-gray-600 w-full mt-2 rounded-t-lg shadow-lg flex items-center justify-center"
                  >
                    <span className="text-white text-xl font-bold">2</span>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>

          {/* First Place Podium - Centered and Tallest */}
          <div className="mx-auto z-20">
            {firstPlace && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                >
                  <FaCrown className="text-yellow-400 text-4xl filter drop-shadow-lg" />
                </motion.div>
                <div className="relative">
                  <div className="relative z-10">
                    <img
                      src={firstPlace.teamLogo}
                      alt={firstPlace.teamName}
                      className="w-28 h-28 rounded-full object-cover border-4 border-yellow-400 shadow-xl"
                    />
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-800 rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                      <FaTrophy size={20} />
                    </div>
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-yellow-500 opacity-20"
                  >
                    <FaTrophy size={160} className="filter blur-[2px]" />
                  </motion.div>
                </div>
                <div className="text-center mt-2 relative z-10">
                  <p className="font-bold text-lg text-white">{firstPlace.teamName}</p>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="h-16 sm:h-28 bg-gradient-to-b from-yellow-400 to-yellow-600 w-40 mt-2 rounded-t-lg shadow-lg flex items-center justify-center"
                  >
                    <span className="text-white text-2xl font-bold">1</span>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Third Place Podium */}
          <div className="absolute right-0 bottom-0 sm:right-28 w-full sm:w-auto">
            {thirdPlace && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <div className="relative">
                  <div className="relative z-10">
                    <img
                      src={thirdPlace.teamLogo}
                      alt={thirdPlace.teamName}
                      className="w-20 h-20 rounded-full object-cover border-4 border-amber-700 shadow-lg"
                    />
                    <div className="absolute -top-2 -right-2 bg-amber-700 text-amber-300 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                      <FaAward size={16} />
                    </div>
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-amber-700 opacity-20"
                  >
                    <FaAward size={120} className="filter blur-[2px]" />
                  </motion.div>
                </div>
                <div className="text-center mt-2 relative z-10">
                  <p className="font-semibold text-white">{thirdPlace.teamName}</p>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="h-8 sm:h-16 bg-gradient-to-b from-amber-600 to-amber-800 w-full mt-2 rounded-t-lg shadow-lg flex items-center justify-center"
                  >
                    <span className="text-white text-xl font-bold">3</span>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Podium Base */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.9, duration: 0.3 }}
          className="h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 w-full mt-2 rounded-lg shadow-lg origin-bottom"
        />
      </div>
    );
  };

  return (
    <HomeLayout>
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-press font-bold mb-4 text-primary">
            <span className="text-primary-dark">Champions</span> Leaderboard
          </h1>
          <div className="w-16 sm:w-24 h-1 bg-primary mx-auto rounded-full" />
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded-lg">
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Custom Dropdown */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-lg text-gray-300 italic">
                <span className="text-primary font-semibold">
                  {leaderboard.reduce((total, event) => total + (event.placements?.length || 0), 0)}
                </span> champions across <span className="text-primary font-semibold">{leaderboard.length}</span> events
              </p>
              
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 hover:border-primary rounded-lg text-white transition-all duration-300"
                >
                  <span>{selectedEvent === 'all' ? 'All Events' : leaderboard.find(e => e._id === selectedEvent)?.eventName}</span>
                  <FaChevronDown className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 mt-2 right-0 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden w-56"
                    >
                      <div className="max-h-60 overflow-y-auto py-1">
                        <button
                          onClick={() => {
                            setSelectedEvent('all');
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${selectedEvent === 'all' ? 'bg-primary/20 text-primary' : 'text-white'}`}
                        >
                          All Events
                        </button>
                        {leaderboard.map(event => (
                          <button
                            key={event._id}
                            onClick={() => {
                              setSelectedEvent(event._id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${selectedEvent === event._id ? 'bg-primary/20 text-primary' : 'text-white'}`}
                          >
                            {event.eventName}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {filteredLeaderboard.length === 0 ? (
              <div className="bg-gray-800 p-8 rounded-lg text-center">
                <p className="text-gray-400">No leaderboard data available yet</p>
                <p className="text-gray-500 text-sm mt-2">Check back after events are completed</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-16">
                {filteredLeaderboard.map(event => (
                  <motion.div 
                    key={event._id} 
                    className="bg-gray-800/80 backdrop-blur-sm rounded-lg overflow-hidden shadow-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 p-6">
                      <h2 className="text-2xl font-semibold text-white text-center">
                        {event.eventName}
                        <span className={`ml-3 px-3 py-1 text-xs rounded-full inline-block ${
                          event.category === 'team-battle' ? 'bg-blue-900 text-blue-200' : 'bg-green-900 text-green-200'
                        }`}>
                          {event.category === 'team-battle' ? 'Team Battle' : 'Single Battle'}
                        </span>
                      </h2>
                    </div>
                    
                    <div className="p-6 relative">
                      {/* Shine effect */}
                      <div className="absolute inset-0 overflow-hidden">
                        <motion.div 
                          className="w-20 h-96 bg-white/5 blur-xl transform rotate-12"
                          animate={{ 
                            x: ['-100%', '200%'],
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 3,
                            ease: "linear",
                          }}
                        />
                      </div>

                      {event.placements?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12">
                          <FaTrophy className="text-gray-600 text-6xl mb-4 opacity-30" />
                          <p className="text-gray-400 text-center text-lg">No champions yet</p>
                          <p className="text-gray-500 text-sm mt-2">Competition still in progress</p>
                        </div>
                      ) : (
                        renderPodium(event)
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </HomeLayout>
  );
};

export default Leaderboard;