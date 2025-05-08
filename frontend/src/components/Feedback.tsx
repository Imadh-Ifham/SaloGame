import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FaStar } from 'react-icons/fa';
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
      className="max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
    >
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Share Your Thoughts
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Feedback Type */}
        <div className="flex space-x-4 mb-4">
          <button
            type="button"
            onClick={() => setType('feedback')}
            className={`px-4 py-2 rounded-lg ${
              type === 'feedback' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            Feedback
          </button>
          <button
            type="button"
            onClick={() => setType('suggestion')}
            className={`px-4 py-2 rounded-lg ${
              type === 'suggestion' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 dark:bg-gray-700'
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
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-primary"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Rating (only for feedback) */}
        {type === 'feedback' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rating
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className="cursor-pointer"
                  size={24}
                  color={(hover || rating) >= star ? "#ffc107" : "#e4e5e9"}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-primary"
            placeholder={type === 'feedback' ? "Tell us what you think..." : "Share your suggestion..."}
          />
        </div>

        {/* Screenshot Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Screenshot (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
          />
        </div>

        {/* Anonymous Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="anonymous"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="anonymous" className="text-sm text-gray-700 dark:text-gray-300">
            Submit anonymously
          </label>
        </div>

        {/* Email Input (if not anonymous) */}
        {!isAnonymous && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || (type === 'feedback' && rating === 0) || (!isAnonymous && !email)}
          className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </motion.div>
  );
};

export default FeedbackForm;