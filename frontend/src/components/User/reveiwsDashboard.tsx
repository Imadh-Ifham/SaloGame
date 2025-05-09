import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaGamepad, FaDice, FaChessKnight, FaArrowLeft, FaCommentAlt } from 'react-icons/fa';
import { FiPlus, FiHome } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/axios.config';
import { format } from 'date-fns';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

interface Reply {
  _id: string;
  message: string;
  repliedBy: {
    name?: string;
    email: string;
    role: string;
  };
  createdAt: string;
}

interface Feedback {
  _id: string;
  type: 'feedback' | 'suggestion';
  message: string;
  rating?: number;
  category: string;
  createdAt: string;
  isAnonymous: boolean;
  status: 'pending' | 'reviewed' | 'resolved';
  replies?: Reply[];
  user?: {
    name?: string;
    email?: string;
    googlePhotoUrl?: string;
  };
}

const ReviewsDashboard = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    let socket: any;
  
    const fetchFeedbacks = async () => {
      try {
          const token = localStorage.getItem('token');
          if (!token) {
              setError('Authentication required');
              navigate('/auth');
              return;
          }
  
          const response = await axiosInstance.get('/feedback');
          
          if (response.data.success) {
              setFeedbacks(response.data.data);
          } else {
              setError(response.data.message || 'Failed to load reviews');
          }
      } catch (err: any) {
          console.error('Error fetching feedback:', err);
          if (err.response?.status === 401) {
              navigate('/auth');
          }
          setError(err.response?.data?.message || 'Failed to connect to server');
      } finally {
          setLoading(false);
      }
    };

    const initializeSocket = () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const socketUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
      
      socket = io(socketUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    
      socket.on('connect', () => {
        console.log('Connected to feedback socket');
      });
    
      socket.on('connect_error', (error: Error) => {
        console.error('Socket connection error:', error);
        toast.error('Real-time updates unavailable');
      });
    
      socket.on('feedbackReplied', (updatedFeedback: Feedback) => {
        setFeedbacks(prev => prev.map(f => 
          f._id === updatedFeedback._id ? updatedFeedback : f
        ));
        toast.success('New reply received!', {
          icon: '💬',
          duration: 4000
        });
      });
    
      socket.on('feedbackUpdated', (updatedFeedback: Feedback) => {
        setFeedbacks(prev => prev.map(f => 
          f._id === updatedFeedback._id ? updatedFeedback : f
        ));
        toast.success('Feedback status updated!', {
          duration: 3000
        });
      });
    
      socket.on('disconnect', () => {
        console.log('Disconnected from feedback socket');
      });
    };
  
    fetchFeedbacks();
    initializeSocket();
  
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [navigate]);

  const renderStars = (rating: number = 0) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'text-yellow-400' : 'text-gray-400'}
        size={16}
      />
    ));
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'games':
        return <FaGamepad className="text-green-400" />;
      case 'facility':
        return <FaDice className="text-blue-400" />;
      case 'events':
        return <FaChessKnight className="text-purple-400" />;
      case 'service':
        return <FiHome className="text-red-400" />;
      case 'general':
      default:
        return <FaGamepad className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'reviewed':
        return 'bg-blue-500/20 text-blue-400';
      case 'resolved':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const filteredFeedbacks = activeFilter === 'all' 
    ? feedbacks 
    : feedbacks.filter(f => f.category.toLowerCase() === activeFilter.toLowerCase());

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="relative">
            <FaGamepad className="text-6xl text-green-500 mb-4 animate-pulse" />
            <div className="absolute -inset-2 rounded-full bg-green-500 opacity-20 animate-ping"></div>
          </div>
          <p className="text-gray-300 mt-4">Loading game feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 bg-gray-900 min-h-screen">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!feedbacks.length) {
    return (
      <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <FaGamepad className="text-6xl text-green-500 animate-bounce" />
              <div className="absolute -inset-2 rounded-full bg-green-500 opacity-20 animate-ping"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Game Cafe Feedback</h1>
          <p className="text-gray-400 mb-8">No reviews yet. Be the first to share your gaming experience!</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/support/feedback')}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 rounded-lg text-white hover:bg-green-700 transition-colors mx-auto shadow-lg"
          >
            <FiPlus /> Share Your Experience
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
    {/* Dot pattern overlay matching HomeLayout */}
    <div className="absolute inset-0 pattern-dots pattern-green-300 dark:pattern-green-950 
                    pattern-bg-transparent pattern-opacity-5 pattern-size-2 pointer-events-none"></div>

    {/* Dark overlay to make content more readable */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/50 pointer-events-none"></div>

    <div className="relative z-10 max-w-7xl mx-auto">
        {/* Top Navigation */}
        <div className="flex justify-between items-center mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors border border-gray-700 shadow-md"
          >
            <FaArrowLeft />
            Return to Game Hall
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/support/feedback')}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 rounded-lg text-white hover:bg-green-700 transition-colors shadow-lg"
          >
            <FiPlus /> Add Feedback
          </motion.button>
        </div>

        {/* Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative mb-4">
            <FaGamepad className="text-5xl text-green-500" />
            <div className="absolute -inset-2 rounded-full bg-green-500 opacity-20 animate-pulse"></div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Game Feedback Hub</h1>
          <p className="text-gray-400 max-w-2xl">
            See what players are saying about our games, facilities, and services
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeFilter === 'all' 
                ? 'bg-green-600 text-white shadow-lg' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All Feedback
          </button>
          <button
            onClick={() => setActiveFilter('general')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeFilter === 'general' 
                ? 'bg-gray-600 text-white shadow-lg' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FaGamepad /> General
          </button>
          <button
            onClick={() => setActiveFilter('service')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeFilter === 'service' 
                ? 'bg-red-600 text-white shadow-lg' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FiHome /> Service
          </button>
          <button
            onClick={() => setActiveFilter('facility')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeFilter === 'facility' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FaDice /> Facilities
          </button>
          <button
            onClick={() => setActiveFilter('games')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeFilter === 'games' 
                ? 'bg-green-600 text-white shadow-lg' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FaGamepad /> Games
          </button>
          <button
            onClick={() => setActiveFilter('events')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              activeFilter === 'events' 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FaChessKnight /> Events
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-green-500 shadow">
            <h3 className="text-gray-400 text-sm">Total Feedback</h3>
            <p className="text-2xl font-bold text-white">{feedbacks.length}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-yellow-500 shadow">
            <h3 className="text-gray-400 text-sm">Pending</h3>
            <p className="text-2xl font-bold text-white">{feedbacks.filter(f => f.status === 'pending').length}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500 shadow">
            <h3 className="text-gray-400 text-sm">Reviewed</h3>
            <p className="text-2xl font-bold text-white">{feedbacks.filter(f => f.status === 'reviewed').length}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-green-500 shadow">
            <h3 className="text-gray-400 text-sm">Resolved</h3>
            <p className="text-2xl font-bold text-white">{feedbacks.filter(f => f.status === 'resolved').length}</p>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid gap-6">
          {filteredFeedbacks.map((feedback) => (
            <motion.div
              key={feedback._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:border-green-500 transition-all hover:shadow-xl"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 relative">
                  {feedback.user?.googlePhotoUrl ? (
                    <img
                      src={feedback.user.googlePhotoUrl}
                      alt="User"
                      className="w-12 h-12 rounded-full object-cover border-2 border-green-500"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center border-2 border-green-500">
                      <FaGamepad className="text-gray-400" />
                    </div>
                  )}
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-800 ${getStatusColor(feedback.status)} flex items-center justify-center`}>
                    <span className="text-xs">{feedback.status.charAt(0).toUpperCase()}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-white font-medium">
                        {feedback.isAnonymous ? 'Anonymous Gamer' : feedback.user?.name || feedback.user?.email}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {format(new Date(feedback.createdAt), 'MMM dd, yyyy · hh:mm a')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {feedback.type === 'feedback' && renderStars(feedback.rating)}
                    </div>
                  </div>
                  
                  <div className="mt-3 bg-gray-900 p-4 rounded-lg border border-gray-700">
                    <p className="text-gray-300">{feedback.message}</p>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-700 text-gray-300">
                      {getCategoryIcon(feedback.category)}
                      <span className="capitalize">{feedback.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                        {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                      </span>
                      {feedback.replies && feedback.replies.length > 0 && (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs">
                          <FaCommentAlt size={12} /> {feedback.replies.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Replies Section */}
              {feedback.replies && feedback.replies.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h4 className="text-sm text-gray-400 font-medium flex items-center gap-2">
                    <FaCommentAlt /> Responses
                  </h4>
                  {feedback.replies.map((reply) => (
                    <div 
                      key={reply._id}
                      className="pl-4 ml-4 border-l-2 border-green-500"
                    >
                      <div className="bg-gray-700 rounded-lg p-4 shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-white text-sm font-medium">
                              {reply.repliedBy.name || reply.repliedBy.email}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {reply.repliedBy.role}
                            </p>
                          </div>
                          <p className="text-gray-400 text-xs">
                            {format(new Date(reply.createdAt), 'MMM dd, yyyy · hh:mm a')}
                          </p>
                        </div>
                        <p className="text-gray-300 mt-2">
                          {reply.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">Have something to share about your gaming experience?</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/support/feedback')}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 rounded-lg text-white hover:bg-green-700 transition-colors shadow-lg mx-auto"
          >
            <FiPlus /> Add Your Feedback
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ReviewsDashboard;