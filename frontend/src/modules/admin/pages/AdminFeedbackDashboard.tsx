import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaGamepad, FaReply } from 'react-icons/fa';
import { format } from 'date-fns';
import axiosInstance from '@/axios.config';
import { toast } from 'react-hot-toast';
import FeedbackChart from "../components/FeedbackChart";
import { PDFViewer } from '@react-pdf/renderer';
import FeedbackSummaryPDF from '../components/FeedbackSummaryPDF';
import { FiDownload } from 'react-icons/fi';
import { io, Socket } from 'socket.io-client';

interface FeedbackReply {
  _id: string;
  message: string;
  createdAt: string;
  repliedBy: {
    name?: string;
    email: string;
    role: string;
  };
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
  replies?: FeedbackReply[];
  user?: {
    name?: string;
    email?: string;
    googlePhotoUrl?: string;
  };
}

const AdminFeedbackDashboard: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editedReplyText, setEditedReplyText] = useState('');
  const [showPDF, setShowPDF] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    fetchFeedbacks();
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const socketUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
    
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    newSocket.on('connect', () => {
      console.log('Admin connected to feedback socket');
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    // Listen for new feedback submissions
    newSocket.on('newFeedback', (newFeedback: Feedback) => {
      setFeedbacks(prev => [newFeedback, ...prev]);
      toast.success('New feedback received!');
    });
    
    // Listen for feedback status updates
    newSocket.on('feedbackStatusUpdate', (updatedFeedback: Feedback) => {
      setFeedbacks(prev => prev.map(f => 
        f._id === updatedFeedback._id ? updatedFeedback : f
      ));
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await axiosInstance.get('/feedback');
      if (response.data.success) {
        setFeedbacks(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (feedbackId: string) => {
    try {
      if (!replyText.trim()) {
        toast.error('Reply cannot be empty');
        return;
      }
  
      const response = await axiosInstance.post(`/feedback/${feedbackId}/reply`, {
        message: replyText
      });
  
      if (response.data.success) {
        // Emit socket event with updated feedback
        socket?.emit('adminReply', response.data.data);
        
        toast.success('Reply sent successfully');
        setReplyText('');
        setActiveReplyId(null);
        // Refresh feedbacks to get updated data
        await fetchFeedbacks();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add reply');
    }
  };

  const updateStatus = async (feedbackId: string, status: Feedback['status']) => {
    try {
      const response = await axiosInstance.patch(`/feedback/${feedbackId}/status`, { status });
      
      if (response.data.success) {
        // Emit socket event with updated status
        socket?.emit('statusUpdate', response.data.data);
        
        toast.success('Status updated successfully');
        setFeedbacks(prev => prev.map(f => 
          f._id === feedbackId ? { ...f, status } : f
        ));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleEditReply = async (feedbackId: string, replyId: string) => {
    try {
      if (!editedReplyText.trim()) {
        toast.error('Reply cannot be empty');
        return;
      }
  
      const response = await axiosInstance.patch(`/feedback/${feedbackId}/reply/${replyId}`, {
        message: editedReplyText
      });
  
      if (response.data.success) {
        // Emit socket event with updated feedback
        socket?.emit('adminEditReply', response.data.data);
        
        toast.success('Reply updated successfully');
        setEditingReplyId(null);
        setEditedReplyText('');
        await fetchFeedbacks();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update reply');
    }
  };

  const renderStars = (rating: number = 0) => (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <FaStar
          key={i}
          className={i < rating ? 'text-yellow-400' : 'text-gray-400'}
          size={16}
        />
      ))}
    </div>
  );

  const filteredFeedbacks = feedbacks.filter(f => 
    filter === 'all' ? true : f.status === filter
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Feedback Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage and respond to user feedback and suggestions
          </p>
        </div>
        <button
          onClick={() => setShowPDF(!showPDF)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <FiDownload size={16} />
          <span>{showPDF ? 'Hide Report' : 'Generate Report'}</span>
        </button>
        
        {/* Analytics Chart */}
        <FeedbackChart feedbacks={feedbacks} />
        
        {/* Filter Controls */}
        <div className="flex gap-4 mb-6">
          {(['all', 'pending', 'reviewed', 'resolved'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filter === status
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
  
        {/* Feedbacks List */}
        <div className="space-y-4">
          {filteredFeedbacks.map((feedback) => (
            <motion.div
              key={feedback._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow"
            >
              {/* Feedback Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {feedback.isAnonymous ? 'Anonymous User' : feedback.user?.name || feedback.user?.email}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(feedback.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {feedback.type === 'feedback' && renderStars(feedback.rating)}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    feedback.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    feedback.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {feedback.status}
                  </span>
                </div>
              </div>
             
              {/* Feedback Content */}
              <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-300">{feedback.message}</p>
              </div>
  
              {/* Status Update */}
              <div className="flex gap-2 mb-4">
                <select
                  value={feedback.status}
                  onChange={(e) => updateStatus(feedback._id, e.target.value as Feedback['status'])}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
  
              {/* Replies Section */}
              {feedback.replies && feedback.replies.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Replies</h4>
                  {feedback.replies.map((reply) => (
                    <div key={reply._id} className="pl-4 border-l-2 border-primary">
                      {editingReplyId === reply._id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editedReplyText}
                            onChange={(e) => setEditedReplyText(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            rows={2}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingReplyId(null);
                                setEditedReplyText('');
                              }}
                              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleEditReply(feedback._id, reply._id)}
                              className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{reply.message}</p>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-500 mt-1">
                              {reply.repliedBy.name || reply.repliedBy.email} ({reply.repliedBy.role}) -
                              {format(new Date(reply.createdAt), 'MMM dd, yyyy HH:mm')}
                            </p>
                            <button
                              onClick={() => {
                                setEditingReplyId(reply._id);
                                setEditedReplyText(reply.message);
                              }}
                              className="text-xs text-primary hover:text-primary-dark"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Reply Form */}
              <div className="mt-4">
                {activeReplyId === feedback._id ? (
                  <div className="space-y-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={3}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setActiveReplyId(null);
                          setReplyText('');
                        }}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReply(feedback._id)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                      >
                        Send Reply
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveReplyId(feedback._id)}
                    className="flex items-center gap-2 text-primary hover:text-primary-dark"
                  >
                    <FaReply />
                    Reply
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* PDF Viewer Component */}
        {showPDF && (
          <div className="mt-6 h-screen">
            <PDFViewer style={{ width: '100%', height: '100%' }}>
              <FeedbackSummaryPDF feedbacks={feedbacks} />
            </PDFViewer>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFeedbackDashboard;