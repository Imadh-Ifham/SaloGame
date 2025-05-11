import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FaStar, FaCamera, FaLightbulb, FaCommentAlt, FaGamepad } from 'react-icons/fa';
import axiosInstance from '@/axios.config';
import { NeonGradientCard } from '@/components/ui/neon-gradient-card';
import HomeLayout from '../modules/users/layout/HomeLayout';
import { useNavigate } from 'react-router-dom';

const categories = [
  { id: 'general', label: 'General' },
  { id: 'service', label: 'Service' },
  { id: 'facility', label: 'Facility' },
  { id: 'games', label: 'Games' },
  { id: 'events', label: 'Events' }
];

const FeedbackForm = () => {
  const [type, setType] = useState<'feedback' | 'suggestion'>('feedback');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [rating, setRating] = useState<number>(0);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('message', message);
      formData.append('category', category);
      formData.append('isAnonymous', String(isAnonymous));
      if (!isAnonymous) formData.append('email', email);
      if (type === 'feedback') formData.append('rating', String(rating));
      if (screenshot) formData.append('screenshot', screenshot);

      await axiosInstance.post('/feedback', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Thank you for your feedback!');
      // Reset form
      setMessage('');
      setCategory('general');
      setRating(0);
      setScreenshot(null);
      setIsAnonymous(false);
      setEmail('');
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
      console.error('Feedback submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HomeLayout>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <FaGamepad className="text-5xl text-primary" />
              <div className="absolute -inset-2 rounded-full bg-primary opacity-20 animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-4xl font-press font-bold mb-4">
            <span className="text-primary">Your Voice</span>{' '}
            <span className="text-white">Matters</span>
          </h1>
          <div className="w-24 h-1 bg-primary/70 mx-auto rounded-full mb-6" />
          <p className="text-gray-400 max-w-2xl mx-auto">
            Help us improve your gaming experience by sharing your thoughts and suggestions
          </p>
        </motion.div>

        {/* Feedback Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-xl mx-auto"
        >
          <NeonGradientCard
            className="w-full"
            neonColors={{ firstColor: "#00FF8E", secondColor: "#00D1B2" }}
            borderSize={1}
            borderRadius={25}
          >
            <div className="p-6 bg-gray-800/40 backdrop-blur-lg rounded-2xl">
              <div className="flex items-center mb-6">
                {type === 'feedback' ? (
                  <FaCommentAlt className="text-primary mr-3 text-xl" />
                ) : (
                  <FaLightbulb className="text-yellow-500 mr-3 text-xl" />
                )}
                <h3 className="text-2xl font-bold text-white">
                  {type === 'feedback' ? 'Share Your Feedback' : 'Make a Suggestion'}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rest of the form fields remain the same, just updating some colors */}
                <div className="flex space-x-2 p-1 bg-gray-700/50 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setType('feedback')}
                    className={`flex-1 py-2 px-4 rounded-md transition-all ${
                      type === 'feedback'
                        ? 'bg-primary text-white shadow-sm font-medium'
                        : 'text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Feedback
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('suggestion')}
                    className={`flex-1 py-2 px-4 rounded-md transition-all ${
                      type === 'suggestion'
                        ? 'bg-primary text-white shadow-sm font-medium'
                        : 'text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Suggestion
                  </button>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-600 bg-gray-700/50 text-white px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating */}
                {type === 'feedback' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      How would you rate your experience?
                    </label>
                    <div className="flex justify-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          className="focus:outline-none"
                          onMouseEnter={() => setHover(star)}
                          onMouseLeave={() => setHover(null)}
                          onClick={() => setRating(star)}
                        >
                          <FaStar
                            className="transition-transform hover:scale-125"
                            size={28}
                            color={(hover || rating) >= star ? "#f59e0b" : "#4B5563"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {type === 'feedback' ? 'Your Feedback' : 'Your Suggestion'}
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    className="w-full rounded-lg border border-gray-600 bg-gray-700/50 text-white px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={type === 'feedback' ? "What did you like or dislike?" : "How can we improve?"}
                  />
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Attach Screenshot (optional)
                  </label>
                  <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-600 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 cursor-pointer transition-colors">
                    <div className="flex flex-col items-center justify-center">
                      <FaCamera className="text-gray-400 text-2xl mb-2" />
                      <p className="text-sm text-gray-400">
                        {screenshot ? screenshot.name : 'Click to upload or drag and drop'}
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Anonymous Toggle */}
                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    <span className="ml-3 text-sm font-medium text-gray-300">
                      Submit anonymously
                    </span>
                  </label>
                </div>

                {/* Email Input */}
                {!isAnonymous && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-600 bg-gray-700/50 text-white px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || (type === 'feedback' && rating === 0) || (!isAnonymous && !email)}
                  className={`w-full px-6 py-3 rounded-lg font-medium text-white transition-all ${
                    loading
                      ? 'bg-primary/50 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary/90 focus:ring-4 focus:ring-primary/30'
                  } flex items-center justify-center`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit ' + (type === 'feedback' ? 'Feedback' : 'Suggestion')
                  )}
                </button>
              </form>
              
            </div>
          </NeonGradientCard>
        </motion.div>
        {/* See what others are saying button */}
          <button
            onClick={() => navigate('/support/reviews')}
            className="mt-6 px-6 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 transition-colors shadow-lg"
          >
            See what others are saying
          </button>
      </div>
    </HomeLayout>
  );
};

export default FeedbackForm;