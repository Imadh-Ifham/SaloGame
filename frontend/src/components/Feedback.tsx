import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FaStar, FaCamera, FaLightbulb, FaCommentAlt } from 'react-icons/fa';
import axiosInstance from '@/axios.config';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center mb-6">
        {type === 'feedback' ? (
          <FaCommentAlt className="text-blue-500 mr-3 text-xl" />
        ) : (
          <FaLightbulb className="text-yellow-500 mr-3 text-xl" />
        )}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {type === 'feedback' ? 'Share Your Feedback' : 'Make a Suggestion'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Feedback Type Toggle */}
        <div className="flex space-x-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <button
            type="button"
            onClick={() => setType('feedback')}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              type === 'feedback'
                ? 'bg-white dark:bg-gray-600 shadow-sm font-medium'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            Feedback
          </button>
          <button
            type="button"
            onClick={() => setType('suggestion')}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              type === 'suggestion'
                ? 'bg-white dark:bg-gray-600 shadow-sm font-medium'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            Suggestion
          </button>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Rating (only for feedback) */}
        {type === 'feedback' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
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
                    color={(hover || rating) >= star ? "#f59e0b" : "#d1d5db"}
                  />
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {type === 'feedback' ? 'Your Feedback' : 'Your Suggestion'}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder={
              type === 'feedback' 
                ? "What did you like or dislike about your experience?" 
                : "How can we improve our service?"
            }
          />
        </div>

        {/* Screenshot Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Attach Screenshot (optional)
          </label>
          <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors">
            <div className="flex flex-col items-center justify-center">
              <FaCamera className="text-gray-400 text-2xl mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
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
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Submit anonymously
            </span>
          </label>
        </div>

        {/* Email Input (if not anonymous) */}
        {!isAnonymous && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'
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
    </motion.div>
  );
};

export default FeedbackForm;