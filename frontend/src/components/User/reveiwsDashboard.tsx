import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaGamepad, FaDice, FaChessKnight } from 'react-icons/fa';
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
        const response = await axiosInstance.get('/api/feedback', {
          headers: {
            'Content-Type': 'application/json'
            // Auth token should be handled by axiosInstance defaults
          }
        });
        if (response.data.success) {
          setFeedbacks(response.data.data);
        } else {
          setError(response.data.message || 'Failed to load reviews');
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to connect to server';
        setError(errorMessage);
        console.error('Error fetching feedback:', err);
      } finally {
        setLoading(false);
      }
    };
    
    const initializeSocket = () => {
      socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000', {
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
  
      socket.on('newFeedback', (newFeedback: Feedback) => {
        setFeedbacks(prev => [newFeedback, ...prev]);
        toast.success('New feedback received!');
      });
  
      socket.on('feedbackUpdated', (updatedFeedback: Feedback) => {
        setFeedbacks(prev => prev.map(f => 
          f._id === updatedFeedback._id ? updatedFeedback : f
        ));
        toast.success('Feedback updated!');
      });
  
      socket.on('feedbackReplied', (updatedFeedback: Feedback) => {
        setFeedbacks(prev => prev.map(f => 
          f._id === updatedFeedback._id ? updatedFeedback : f
        ));
        toast.success('New reply added!');
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
  }, []);

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
        return <FaDice className="text-green-400" />;
      case 'events':
        return <FaChessKnight className="text-green-400" />;
      case 'service':
        return <FiHome className="text-green-400" />;
      case 'general':
      default:
        return <FaGamepad className="text-gray-400" />;
    }
  };

  const filteredFeedbacks = activeFilter === 'all' 
    ? feedbacks 
    : feedbacks.filter(f => f.category.toLowerCase() === activeFilter.toLowerCase());

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-pulse flex flex-col items-center">
          <FaGamepad className="text-4xl text-green-500 mb-4 animate-bounce" />
          <p className="text-gray-300">Loading game feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 bg-gray-900 min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!feedbacks.length) {
    return (
      <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <FaGamepad className="text-5xl text-green-500" />
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
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <FaGamepad className="text-4xl text-green-500" />
            <h1 className="text-3xl font-bold text-white">SaloGame Feedback</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/support/feedback')}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 rounded-lg text-white hover:bg-green-700 transition-colors shadow-lg"
          >
            <FiPlus /> Add Feedback
          </motion.button>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
  <button
    onClick={() => setActiveFilter('all')}
    className={`px-4 py-2 rounded-full ${
      activeFilter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300'
    } transition-colors`}
  >
    All Feedback
  </button>
  <button
    onClick={() => setActiveFilter('general')}
    className={`px-4 py-2 rounded-full flex items-center gap-2 ${
      activeFilter === 'general' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300'
    } transition-colors`}
  >
    <FaGamepad /> General
  </button>
  <button
    onClick={() => setActiveFilter('service')}
    className={`px-4 py-2 rounded-full flex items-center gap-2 ${
      activeFilter === 'service' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300'
    } transition-colors`}
  >
    <FiHome /> Service
  </button>
  <button
    onClick={() => setActiveFilter('facility')}
    className={`px-4 py-2 rounded-full flex items-center gap-2 ${
      activeFilter === 'facility' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300'
    } transition-colors`}
  >
    <FaDice /> Facilities
  </button>
  <button
    onClick={() => setActiveFilter('games')}
    className={`px-4 py-2 rounded-full flex items-center gap-2 ${
      activeFilter === 'games' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300'
    } transition-colors`}
  >
    <FaGamepad /> Games
  </button>
  <button
    onClick={() => setActiveFilter('events')}
    className={`px-4 py-2 rounded-full flex items-center gap-2 ${
      activeFilter === 'events' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300'
    } transition-colors`}
  >
    <FaChessKnight /> Events
  </button>
</div>

        {/* Reviews Grid */}
        <div className="grid gap-6">
          {filteredFeedbacks.map((feedback) => (
            <motion.div
              key={feedback._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 hover:border-green-500 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
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
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-white font-medium">
                        {feedback.isAnonymous ? 'Anonymous Gamer' : feedback.user?.name || feedback.user?.email}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {format(new Date(feedback.createdAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {feedback.type === 'feedback' && renderStars(feedback.rating)}
                    </div>
                  </div>
                  <p className="text-gray-300 mt-3 bg-gray-900 p-4 rounded-lg">
                    {feedback.message}
                  </p>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-700 text-gray-300">
                      {getCategoryIcon(feedback.category)}
                      <span className="capitalize">{feedback.category}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {feedback.type === 'suggestion' ? 'Suggestion' : 'Rating'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="mt-4 flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  feedback.status === 'pending' ? 'bg-yellow-900/50 text-yellow-300' :
                  feedback.status === 'reviewed' ? 'bg-blue-900/50 text-blue-300' :
                  'bg-green-900/50 text-green-300'
                }`}>
                  {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                </span>
              </div>
              
              {/* Replies Section */}
              {feedback.replies && feedback.replies.length > 0 && (
                <div className="mt-4 space-y-3">
                  {feedback.replies.map((reply) => (
                    <div 
                      key={reply._id}
                      className="pl-4 border-l-2 border-green-500 mt-4"
                    >
                      <div className="bg-gray-700 rounded-lg p-4">
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
                            {format(new Date(reply.createdAt), 'MMM dd, yyyy HH:mm')}
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

        {/* Bottom Navigation */}
        <div className="mt-12 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors border border-gray-700"
          >
            <FiHome />
            Return to Game Hall
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ReviewsDashboard;